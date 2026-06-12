import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

export default class Stall3D {
  constructor(container, options = {}) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) throw new Error('Container element required');

    this.container = container;
    this.opts = Object.assign({
      cowCount: 30,
      spacing: 3.0,
      planeSize: 1.4,
      planeY: 1.1,
      assetBase: '/assets/kuh_bilder/',
      startOffset: -4.0,
      onSlotClick: null // callback(slotData)
    }, options);

    this._init();
    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
  }

  _init(){
    const o = this.opts;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe9eef2);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 1000);
    // start at beginning of aisle
    this.camera.position.set(-5, 1.6, o.startOffset);

    this.renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height, false);
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.maxPolarAngle = Math.PI/2.2; // limit looking up
    this.controls.target.set(0, o.planeY, 0);

    // lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    hemi.position.set(0, 50, 0);
    this.scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(-10, 20, 10);
    this.scene.add(dir);

    // floor (aisle)
    const totalLength = (o.cowCount-1)*o.spacing;
    const floorGeo = new THREE.PlaneGeometry(8, totalLength + 8);
    const floorMat = new THREE.MeshStandardMaterial({color:0xf7f7f7, roughness:0.95});
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.position.set(0, 0, totalLength/2);
    this.scene.add(floor);

    // loader
    this.loader = new THREE.TextureLoader();
    this.loader.setCrossOrigin('anonymous');

    this.planeGeo = new THREE.PlaneGeometry(o.planeSize, o.planeSize);
    this.meshes = [];

    // raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // scroll smoothing state
    this._targetZ = this.camera.position.z;
    this._scrollSpeed = 0.06;

    // events
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onResize = this._onResize.bind(this);
    this.renderer.domElement.addEventListener('pointermove', this._onPointerMove);
    this.renderer.domElement.addEventListener('click', this._onClick);
    this.renderer.domElement.addEventListener('wheel', this._onWheel, {passive:false});
    window.addEventListener('resize', this._onResize);

    // prepare and add cows
    this._createCows();
  }

  _createCows(){
    const o = this.opts;
    const totalLength = (o.cowCount-1)*o.spacing;

    // create default placeholder material (SVG data url)
    const placeholder = this._svgDataURL('Bild wird geladen', 512, 512, '#cccccc', '#666');
    const placeholderTex = this.loader.load(placeholder);

    for(let i=0;i<o.cowCount;i++){
      const mat = new THREE.MeshStandardMaterial({map: placeholderTex, side: THREE.DoubleSide, transparent:true});
      const mesh = new THREE.Mesh(this.planeGeo, mat);
      mesh.rotation.y = Math.PI/2; // face the aisle
      const z = i * o.spacing;
      mesh.position.set(0, o.planeY, z);

      // attach test data (to be replaced by loadData)
      mesh.userData = {
        id: i+1,
        name: `Kuh ${i+1}`,
        earTag: `OH-${String(i+1).padStart(3,'0')}`,
        breed: 'MusterRind',
        place: i+1,
        imgPath: `${o.assetBase}${i+1}.png`
      };

      this.scene.add(mesh);
      this.meshes.push(mesh);

      // load texture async with fallback
      this._loadTextureForMesh(mesh, mesh.userData.imgPath, i+1);
    }
  }

  _loadTextureForMesh(mesh, url, place){
    const o = this.opts;
    this.loader.load(url,
      (tex)=>{
        mesh.material.map = tex; mesh.material.needsUpdate = true; mesh.userData._loaded = true; mesh.userData.imageURL = this._resolveTextureSrc(tex);
      },
      undefined,
      ()=>{
        // on error load dynamic svg fallback saying "Bild fehlt für Platz X"
        const fallback = this._svgDataURL(`Bild fehlt f. Platz ${place}`, 1024, 1024, '#f2f2f2', '#b33');
        this.loader.load(fallback, (tex)=>{ mesh.material.map = tex; mesh.material.needsUpdate = true; mesh.userData.imageURL = fallback; });
      }
    );
  }

  _svgDataURL(text, w=512, h=512, bg='#ddd', fg='#444'){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='24' fill='${fg}'>${text}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  _resolveTextureSrc(texture){
    try{ if(texture && texture.image && (texture.image.src || texture.image.currentSrc)) return texture.image.src || texture.image.currentSrc; }catch(e){}
    return null;
  }

  _onPointerMove(e){
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const ints = this.raycaster.intersectObjects(this.meshes, false);
    this.renderer.domElement.style.cursor = ints.length ? 'pointer' : '';
  }

  _onClick(e){
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const ints = this.raycaster.intersectObjects(this.meshes, false);
    if(ints.length){
      const mesh = ints[0].object;
      const data = mesh.userData;
      // callback
      if(typeof this.opts.onSlotClick === 'function') this.opts.onSlotClick(data);
      // focus camera softly
      this.focusOnPlace(data.place);
    }
  }

  _onWheel(e){
    e.preventDefault();
    const delta = e.deltaY * 0.02; // sensitivity
    // move target along Z
    const totalLength = (this.opts.cowCount-1)*this.opts.spacing;
    const minZ = this.opts.startOffset - 2.0;
    const maxZ = totalLength + 4.0;
    this._targetZ = THREE.MathUtils.clamp(this._targetZ + delta, minZ, maxZ);
  }

  _onResize(){
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h,false);
  }

  focusOnPlace(place, speed=0.12){
    const z = (place-1) * this.opts.spacing;
    // move camera.z to z - offset so camera is slightly before the slot
    const targetZ = z - 2.2;
    this._targetZ = THREE.MathUtils.clamp(targetZ, this.opts.startOffset - 4, (this.opts.cowCount-1)*this.opts.spacing + 6);
  }

  _animate(){
    // smooth camera movement towards _targetZ
    const dz = this._targetZ - this.camera.position.z;
    if(Math.abs(dz) > 0.001){
      this.camera.position.z += dz * this._scrollSpeed;
      this.controls.target.z += dz * this._scrollSpeed;
      this.controls.update();
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._animate);
  }

  // expose a small API to update data
  updateData(jsonArray){
    // expect array of objects with place (1..N) and other fields
    for(const item of jsonArray){
      const idx = (item.place || item.id) - 1;
      if(idx>=0 && idx < this.meshes.length){
        const mesh = this.meshes[idx];
        mesh.userData = Object.assign(mesh.userData || {}, item);
        if(item.imgPath) {
          mesh.userData.imgPath = item.imgPath;
          this._loadTextureForMesh(mesh, item.imgPath, item.place || idx+1);
        }
      }
    }
  }

  dispose(){
    this.renderer.domElement.removeEventListener('pointermove', this._onPointerMove);
    this.renderer.domElement.removeEventListener('click', this._onClick);
    this.renderer.domElement.removeEventListener('wheel', this._onWheel);
    window.removeEventListener('resize', this._onResize);
    // TODO: dispose geometries, textures, materials more thoroughly
  }
}
