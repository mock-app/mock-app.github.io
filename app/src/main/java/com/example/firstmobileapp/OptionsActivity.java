package com.example.firstmobileapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class OptionsActivity extends AppCompatActivity {

    Button btnMockAppBook, btnMockAppFilm, btnMockAppMusic;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_options);

        btnMockAppBook = findViewById(R.id.btnMockAppBook);
        btnMockAppFilm = findViewById(R.id.btnMockAppFilm);
        btnMockAppMusic = findViewById(R.id.btnMockAppMusic);

        btnMockAppBook.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(OptionsActivity.this, WebViewActivity.class);
                intent.putExtra("url", "https://mock-app.github.io/#/book");
                startActivity(intent);
            }
        });

        btnMockAppMusic.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(OptionsActivity.this, WebViewActivity.class);
                intent.putExtra("url", "https://mock-app.github.io/#/music");
                startActivity(intent);
            }
        });

        btnMockAppFilm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(OptionsActivity.this, "Coming soon...", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
