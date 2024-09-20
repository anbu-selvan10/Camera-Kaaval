import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

const Report = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permissions required', 'Please allow access to camera and gallery.');
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert('Permission Error', 'Failed to request permissions.');
      return false;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Camera Error', 'Failed to open camera.');
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Gallery Error', 'Failed to open gallery.');
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const submitImage = () => {
    // Handle image submission logic here
    Alert.alert('Image Submitted', 'Your image has been submitted successfully!');
    removeImage(); // Optionally remove the image after submission
  };

  return (
    <View style={styles.containerrep}>
      <ScrollView contentContainerStyle={styles.scrollrep}>
      <View>
        <Text style={styles.textrep}>Want to photograph?</Text>
      </View>

      {/* Buttons container */}
      <View style={styles.buttonContainerrep}>
        <TouchableOpacity style={styles.iconButtonrep} onPress={openCamera}>
          <Ionicons name="camera" size={30} color="white" />
          <Text style={styles.iconText}>Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButtonrep} onPress={openGallery}>
          <Ionicons name="images" size={30} color="white" />
          <Text style={styles.iconText}>Open Gallery</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.imagerep} />
          <View style={styles.buttonContainerrep}>
            <TouchableOpacity style={styles.actionButton} onPress={submitImage}>
              <Text style={styles.actionButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={removeImage}>
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.descreport}>
        <Text style={styles.licensetxt}>Car License Plate</Text>
        <Text style={styles.licenserepdesc}>
          Make sure the car license plate is visible
        </Text>
      </View>

      <View style={styles.descreport}>
        <Text style={styles.licensetxt}>Car Image</Text>
        <Text style={styles.licenserepdesc}>
          Capture the entire car 
        </Text>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerrep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textrep: {
    marginBottom: 40,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainerrep: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonrep: {
    flexDirection: 'row',
    backgroundColor: '#90EE90',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: 200,
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#90EE90',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    width: 100,
    alignItems: 'center',
    marginTop:10,
  },
  actionButtonText: {
    color: 'black',
    fontSize: 16,
  },
  iconText: {
    color: 'black',
    fontSize: 16,
    marginLeft: 10,
  },
  imagerep: {
    width: 300,
    height: 200,
    borderRadius: 5,
    borderColor:'#000',
    borderWidth:10,
    alignItems:"center",
    paddingBottom:140,
  },
  descreport: {
    margin:"auto",
    borderRadius: 15,
    borderColor: '#000',
    borderWidth: 2,
    width: "80%",
    alignContent: "center",
    justifyContent:"space-between",
    marginBottom:25,
  },
  licensetxt: {
    margin: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 17,
  },
  licenserepdesc: {
    margin: 5,
    fontSize: 15,
    display: "flex",
  },
  scrollrep:{
    flexGrow:1,
    paddingBottom: height * 0.08, 
    paddingVertical:20,
    
  },
  
});

export default Report;
