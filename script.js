document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');

    function openCamera(cameraId) {
        // Specify desired resolution, for example, 1920x1080
        const constraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                deviceId: cameraId ? { exact: cameraId } : undefined
            }
        };

        // Get access to the webcam
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                video.srcObject = stream;
                // Wait for the video to be playing to get its dimensions
                video.onloadedmetadata = () => {
                    // Set canvas dimensions to match video dimensions
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                };
            })
            .catch(function(error) {
                console.log("Error accessing the webcam", error);
            });
    }

    // List all video input devices (cameras)
    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length > 1) {
                // Assuming the second device in the list is the USB camera
                // You might need logic here to choose the camera dynamically
                openCamera(videoDevices[1].deviceId);
            } else {
                console.log("No secondary camera found. Using the default camera.");
                openCamera(); // Open default camera if no secondary camera is found
            }
        })
        .catch(function(error) {
            console.log("Error listing the devices", error);
        });


    function captureAndSaveImage() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/-/g, '-');

        link.download = `microscope-${timestamp}.png`;
        link.href = imageData;
        link.click();
    }

    // Capture the current frame and download it
    captureButton.addEventListener('click', function() {
        captureAndSaveImage();
    });

    // Attach the capture and save logic to the 'F' key press event
    document.addEventListener('keydown', function(event) {
        console.log(event)
        if (event.key === 'F' || event.key === 'f') {
            captureAndSaveImage();
        }
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
        });
    });
}

});

