package de.rechberg.wildschadenapp

import android.os.Bundle
import android.view.KeyEvent
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import de.rechberg.wildschadenapp.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.webView.apply {
            // Alle Links innerhalb der App öffnen (kein externer Browser)
            webViewClient = WebViewClient()
            // JavaScript einschalten (Ihre Seite braucht es nicht zwingend, schadet aber nicht)
            settings.javaScriptEnabled = true
            // DOM-Speicher für moderne Web-Apps
            settings.domStorageEnabled = true
            // Verbesserte Performance
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true
            // URL Ihrer Webseite
            loadUrl("https://wildschaden-app-rechberg.base44.app/")
        }
    }

    // Zurück-Button navigiert innerhalb der WebView, sonst App minimieren
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && binding.webView.canGoBack()) {
            binding.webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}
