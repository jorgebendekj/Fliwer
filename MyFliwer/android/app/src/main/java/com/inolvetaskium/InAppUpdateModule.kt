package com.inolvetaskium

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.google.android.play.core.appupdate.*
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

class InAppUpdateModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var appUpdateManager: AppUpdateManager? = null
    private val REQUEST_CODE = 1234

    override fun getName(): String = "InAppUpdate"

    init {
        reactContext.addActivityEventListener(this)
    }

    @ReactMethod
    fun checkAndUpdate(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No activity attached")
            return
        }

        appUpdateManager = AppUpdateManagerFactory.create(reactContext)
        val appUpdateInfoTask = appUpdateManager?.appUpdateInfo

        appUpdateInfoTask?.addOnSuccessListener { appUpdateInfo ->
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {

                appUpdateManager?.startUpdateFlowForResult(
                    appUpdateInfo,
                    AppUpdateType.IMMEDIATE,
                    activity,
                    REQUEST_CODE
                )
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        }?.addOnFailureListener {
            promise.reject("UPDATE_CHECK_FAILED", it.message)
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CODE) {
            if (resultCode != Activity.RESULT_OK) {
                // El usuario canceló la actualización
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
