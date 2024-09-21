import { useUser } from '@clerk/clerk-expo';
import React, { useState,useEffect } from 'react';
import { StyleSheet, Dimensions, Text, TextInput, View, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const { width: w } = Dimensions.get('window');

const styles = StyleSheet.create({
  pageregistercontainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titlescaleregister: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 20,
  },
  titleregister: {
    flex: 1,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backregister: {
    position: 'absolute',
    left: 10,
    zIndex: 10,
  },
  registerusername: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00716F',
    borderRadius: 23,
    paddingHorizontal: 10,
    paddingVertical: 2,
    width: '100%',
    marginVertical: 10,
  },
  titleuserreg: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  firstnametitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lastnametitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  registernamescontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  registerfirstname: {
    flex: 1,
    marginRight: 10,
    marginTop: 20,
  },
  registerlastname: {
    flex: 1,
    marginLeft: 10,
    marginTop: 20,
  },
  registertextuser: {
    flex: 1,
    paddingHorizontal: 10,
  },
  buttoncontregContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  buttoncontinuereg: {
    backgroundColor: '#90EE90',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '60%',
    marginTop: 20,
  },
  reguploaddoc: {
    backgroundColor: '#90EE90',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    width: '60%',
  },
  buttonRegisterText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollreg: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#00716F',
  },
});

const Profile = () => {
  const [username, setUsername] = useState<string>('');
  const [firstname, setFirstName] = useState<string>(''); // Added firstName state
  const [lastname, setLastName] = useState<string>(''); // Added lastName state
  const [email, setEmail] = useState<string>(''); // Added email state
  const [mobile, setMobile] = useState<string>(''); // Added mobile state
  const [vehicleno, setVehicleNumber] = useState<string>(''); // Added vehicleNumber state
  const { user } = useUser();

  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      setEmail(user.emailAddresses[0].emailAddress);
    }
  }, [user]);

  // Request permissions for gallery and camera
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

  // Open image picker to choose an image from gallery
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

  // Handle profile update and image upload
  const updateprofilebut = async () => {
    const userData = {
      username,
      email,
      lastname,
      firstname,
      vehicleno,
      mobile,
    };
  
    try {
      const res = await axios.post('http://192.168.1.39:5000/profile', userData);
      console.log("Response Data:", res.data); // Log the response
    } catch (e) {
      console.error("Error:", e); // Log any errors
    }
  };
    

  return (
    <View style={styles.pageregistercontainer}>
      <ScrollView contentContainerStyle={styles.scrollreg}>
        <Text style={styles.titleuserreg}>Username</Text>
        <View style={styles.registerusername}>
          <AntDesign name="user" color="#00716F" size={24} />
          <TextInput
            style={styles.registertextuser}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.registernamescontainer}>
          <View style={styles.registerfirstname}>
            <Text style={styles.firstnametitle}>First Name</Text>
            <View style={styles.registerusername}>
              <AntDesign name="user" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="First Name"
                value={firstname}
                onChangeText={setFirstName}
              />
            </View>
          </View>

          <View style={styles.registerlastname}>
            <Text style={styles.lastnametitle}>Last Name</Text>
            <View style={styles.registerusername}>
              <AntDesign name="user" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="Last Name"
                value={lastname}
                onChangeText={setLastName}
              />
            </View>
          </View>
        </View>

        <Text style={styles.titleuserreg}>Email Address</Text>
        <View style={styles.registerusername}>
          <AntDesign name="mail" color="#00716F" size={24} />
          <TextInput
            style={styles.registertextuser}
            placeholder="Enter your mail ID"
            value={email}
            editable={false}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.titleuserreg}>Phone Number</Text>
        <View style={styles.registerusername}>
          <AntDesign name="phone" color="#00716F" size={24} />
          <TextInput
            style={styles.registertextuser}
            placeholder="Enter your phone no"
            value={mobile}  // Bind the value to mobile state
            onChangeText={setMobile}
          />
        </View>

        <Text style={styles.titleuserreg}>Vehicle Number</Text>
        <View style={styles.registerusername}>
          <AntDesign name="car" color="#00716F" size={24} />
          <TextInput
            style={styles.registertextuser}
            placeholder="Enter your vehicle's license plate no"
            value={vehicleno}
            onChangeText={setVehicleNumber}
          />
        </View>

        <View style={styles.buttoncontregContainer}>
          <TouchableOpacity style={styles.reguploaddoc} onPress={openGallery}>
            <Text style={styles.buttonRegisterText}>Proof Image</Text>
          </TouchableOpacity>

          {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

          <TouchableOpacity style={styles.buttoncontinuereg} onPress={updateprofilebut}>
            <Text style={styles.buttonRegisterText}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

