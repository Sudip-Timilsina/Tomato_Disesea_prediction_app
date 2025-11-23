

from tensorflow.keras.layers import InputLayer, Dense, Conv2D, MaxPool2D, Flatten, Input, Layer, Dropout, RandomFlip, RandomRotation, Resizing, Rescaling, RandomContrast
from tensorflow.keras.models import Model, Sequential, load_model
from tensorflow.keras.layers import GlobalAveragePooling2D, Add, Activation
from tensorflow.keras.layers import BatchNormalization
from tensorflow.keras.utils import register_keras_serializable

CONFIGURATION = {
    "BATCH_SIZE": 32,
    "IMG_SIZE": 256,
    "LEARNING_RATE": 0.001,
    "N_EPOCHS": 10,
    "DROPOUT_RATE": 0.2,
    "REGULARIZATION_RATE": 0.0001,
    "N_FILTERS": 7,
    "KERNEL_SIZE": 3,
    "N_STRIDES": 1,
    "POOL_SIZE": 2,
    "N_DENSE_1": 1024,
    "N_DENSE_2": 128,
    "NUM_CLASSES": 10,
    "PATCH_SIZE": 16,
}

@register_keras_serializable()
class CustomConv2D(Layer):
    def __init__(self, n_filters, kernel_size, strides, padding='valid', name=None):
        super(CustomConv2D, self).__init__(name=name or 'custom_conv_2d')
        self.conv = Conv2D(filters=n_filters, kernel_size=kernel_size, activation='relu', strides=strides, padding=padding, name='conv2d')
        self.batch_norm = BatchNormalization(name='batch_normalization')

    def call(self, x, training=True):
        x = self.conv(x)
        x = self.batch_norm(x, training=training)
        return x

@register_keras_serializable()
class ResidualBlock(Layer):
    def __init__(self, n_channels, strides=1, name=None):
        super(ResidualBlock, self).__init__(name=name or 'res_block')
        self.dotted = (strides != 1)
        self.custom_conv_1 = CustomConv2D(n_channels, 3, strides, padding='same', name='custom_conv_1')
        self.custom_conv_2 = CustomConv2D(n_channels, 3, 1, padding='same', name='custom_conv_2')
        self.activation = Activation('relu', name='activation')
        if self.dotted:
            self.custom_conv_3 = CustomConv2D(n_channels, 1, strides, name='custom_conv_3')

    def call(self, input, training=True):
        x = self.custom_conv_1(input, training=training)
        x = self.custom_conv_2(x, training=training)
        if self.dotted:
            x_add = self.custom_conv_3(input, training=training)
            x_add = Add(name='add')([x, x_add])
        else:
            x_add = Add(name='add')([x, input])
        return self.activation(x_add)

@register_keras_serializable()
class ResNet(Model):
    def __init__(self, **kwargs):
        super(ResNet, self).__init__(name='res_net')
        self.resize_rescale_layers = Sequential([
            Resizing(CONFIGURATION['IMG_SIZE'], CONFIGURATION['IMG_SIZE'], name='resizing'),
            Rescaling(1. / 255, name='rescaling')
        ])
        self.conv = CustomConv2D(64, 7, 2, padding='same', name='initial_conv')
        self.max_pool = MaxPool2D(3, 2, name='max_pool')
        self.conv_2_1 = ResidualBlock(64, name='conv_2_1')
        self.conv_2_2 = ResidualBlock(64, name='conv_2_2')
        self.conv_2_3 = ResidualBlock(64, name='conv_2_3')
        self.conv_3_1 = ResidualBlock(128, 2, name='conv_3_1')
        self.conv_3_2 = ResidualBlock(128, name='conv_3_2')
        self.conv_3_3 = ResidualBlock(128, name='conv_3_3')
        self.conv_3_4 = ResidualBlock(128, name='conv_3_4')
        self.conv_4_1 = ResidualBlock(256, 2, name='conv_4_1')
        self.conv_4_2 = ResidualBlock(256, name='conv_4_2')
        self.conv_4_3 = ResidualBlock(256, name='conv_4_3')
        self.conv_4_4 = ResidualBlock(256, name='conv_4_4')
        self.conv_4_5 = ResidualBlock(256, name='conv_4_5')
        self.conv_4_6 = ResidualBlock(256, name='conv_4_6')
        self.conv_5_1 = ResidualBlock(512, 2, name='conv_5_1')
        self.conv_5_2 = ResidualBlock(512, name='conv_5_2')
        self.conv_5_3 = ResidualBlock(512, name='conv_5_3')
        self.global_pool = GlobalAveragePooling2D(name='global_pool')
        self.fc_3 = Dense(CONFIGURATION["NUM_CLASSES"], activation='softmax', name='fc_3')

    def call(self, x, training=True):
        x = self.resize_rescale_layers(x)
        x = self.conv(x)
        x = self.max_pool(x)
        x = self.conv_2_1(x, training=training)
        x = self.conv_2_2(x, training=training)
        x = self.conv_2_3(x, training=training)
        x = self.conv_3_1(x, training=training)
        x = self.conv_3_2(x, training=training)
        x = self.conv_3_3(x, training=training)
        x = self.conv_3_4(x, training=training)
        x = self.conv_4_1(x, training=training)
        x = self.conv_4_2(x, training=training)
        x = self.conv_4_3(x, training=training)
        x = self.conv_4_4(x, training=training)
        x = self.conv_4_5(x, training=training)
        x = self.conv_4_6(x, training=training)
        x = self.conv_5_1(x, training=training)
        x = self.conv_5_2(x, training=training)
        x = self.conv_5_3(x, training=training)
        x = self.global_pool(x)
        return self.fc_3(x)
