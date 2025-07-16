
# Face-API.js Models

This directory should contain the face-api.js model files for facial recognition functionality.

## Required Models

To enable facial recognition, you need to download the following model files from the face-api.js repository and place them in this directory:

### Required Files:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`
- `face_expression_model-weights_manifest.json`
- `face_expression_model-shard1`

## Download Instructions

1. Visit the face-api.js repository: https://github.com/justadudewhohacks/face-api.js
2. Navigate to the `weights` folder
3. Download all the required model files listed above
4. Place them in this `public/models/` directory

## Alternative Setup

For development/testing purposes, the facial recognition component will fall back to a simulated verification process if the models are not available.

## Security Note

In a production environment, you may want to implement proper face verification by:
1. Storing employee face encodings securely in the database
2. Implementing proper face matching algorithms
3. Adding additional security measures like liveness detection
