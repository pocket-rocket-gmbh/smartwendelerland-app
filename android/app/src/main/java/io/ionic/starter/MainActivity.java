package io.ionic.starter;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import io.pocketrocket.test.PocketRocketPlugin;


public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PocketRocketPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
