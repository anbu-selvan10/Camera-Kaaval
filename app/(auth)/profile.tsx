import { useUser } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import { StyleSheet, Dimensions, Text, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width: w } = Dimensions.get('window');

const styles = StyleSheet.create({
  pageregistercontainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    marginTop: 30,
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
  },
  buttonRegisterText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});


const Profile = () => {
  const [username, setUsername] = useState<string>('');
  const { user } = useUser();

  return (
    <View style={styles.pageregistercontainer}>

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
          value={user?.emailAddresses[0].emailAddress || ''}
          editable={false} 
        />
      </View>

      <Text style={styles.titleuserreg}>Phone Number</Text>
      <View style={styles.registerusername}>
        <AntDesign name="phone" color="#00716F" size={24} />
        <TextInput
          style={styles.registertextuser}
          placeholder="Enter your phone no"
        />
      </View>

      <View style={styles.buttoncontregContainer}>
        <TouchableOpacity style={styles.buttoncontinuereg}>
          <Text style={styles.buttonRegisterText}>Update</Text>
        </TouchableOpacity>
        </View>
    </View>
  );
};

export default Profile;