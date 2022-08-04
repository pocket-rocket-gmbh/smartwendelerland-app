package io.pocketrocket.test;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PocketRocket")
public class PocketRocketPlugin extends Plugin {

    @PluginMethod()
    public void launchARocket(PluginCall call) {
        Integer value = call.getInt("speed");

        // Cool native code that does something really special.
        value = value * 1337;

        JSObject ret = new JSObject();
        ret.put("final_speed", value);
        call.resolve(ret);
    }
}
