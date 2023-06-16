from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import os
from tensorflow.keras.models import load_model
import keras.utils as image
import io


# Initialize Flask
app = Flask(__name__)
CORS(app)

# ------------ MASTER --------------
model = load_model('model.h5')


@app.route('/', methods=['GET'])
def hello():
    response = {
        'status': True,
        'message': 'Hi there! Server is running!',
        'data': None
    }
    return jsonify(response), 200


@app.route('/predict', methods=['POST'])
def predict():
    img = image.load_img(io.BytesIO(request.files['image'].read()), target_size=(
        224, 224), color_mode='grayscale')
    img = np.asarray(img)
    # Mengulang saluran warna
    img_rgb = np.repeat(img[..., np.newaxis], 3, axis=-1)
    img_rgb = np.expand_dims(img_rgb, axis=0)
    output = model.predict(img_rgb)
    max = output[0][0]
    pos = 0
    for i in range(1, 29):
        if output[0][i] > max:
            max = output[0][i]
            pos = i

    if (pos == 0):
        prediction = 'a'
    elif (pos == 1):
        prediction = 'ae'
    elif (pos == 2):
        prediction = 'ba'
    elif (pos == 3):
        prediction = 'ca'
    elif (pos == 4):
        prediction = 'da'
    elif (pos == 5):
        prediction = 'e'
    elif (pos == 6):
        prediction = 'eu'
    elif (pos == 7):
        prediction = 'fa'
    elif (pos == 8):
        prediction = 'ga'
    elif (pos == 9):
        prediction = 'ha'
    elif (pos == 10):
        prediction = 'i'
    elif (pos == 11):
        prediction = 'ja'
    elif (pos == 12):
        prediction = 'ka'
    elif (pos == 13):
        prediction = 'ma'
    elif (pos == 14):
        prediction = 'na'
    elif (pos == 15):
        prediction = 'nga'
    elif (pos == 16):
        prediction = 'nya'
    elif (pos == 17):
        prediction = 'o'
    elif (pos == 18):
        prediction = 'pa'
    elif (pos == 19):
        prediction = 'qa'
    elif (pos == 20):
        prediction = 'ra'
    elif (pos == 21):
        prediction = 'sa'
    elif (pos == 22):
        prediction = 'ta'
    elif (pos == 23):
        prediction = 'u'
    elif (pos == 24):
        prediction = 'va'
    elif (pos == 25):
        prediction = 'wa'
    elif (pos == 26):
        prediction = 'xa'
    elif (pos == 27):
        prediction = 'ya'
    elif (pos == 28):
        prediction = 'za'
    return jsonify({"result": prediction}), 200


# Initialize Flask
app.debug = True
CORS(app)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 80))
    app.run(host='0.0.0.0', port=port)
