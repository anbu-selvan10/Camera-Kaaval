import { useUser } from '@clerk/clerk-expo';
import React from "react";
import { StyleSheet, Image, Dimensions, Text, View, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

const w = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  userfpcontainer: {
    padding: 20,
    margin: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'white',
    width: '90%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', 
  },
  imagefituserfp: {
    width: "120%",
    height: "120%",
    borderRadius: 15,
    position: 'absolute', 
    top: 0,
    left: 0,
  },
  userpopularfp: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 13,
    textAlign: "center",
  },
  userfpc1: {
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 1,
    padding: 15,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textfpc1: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reporticon: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    height: height * 0.08,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: height * 0.08, 
  },
});

const Home = () => {
  const { user } = useUser();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={[styles.userfpcontainer, { width: w * 0.95 }]}>
          <Image 
            source={require("/camera_kaaval_clerk/Camera-Kaaval/assets/images/sliderimg2.jpeg")} 
            style={styles.imagefituserfp} 
            resizeMode="cover" 
          />
          {/* <Text style={styles.usertitlefp} numberOfLines={1}>
            Welcome to Camera Kaaval
          </Text> */}
        </View>

        <Text style={styles.userpopularfp}>
          Popular Actions 
        </Text>
        
        <View style={[styles.userfpc1, { width: w * 0.95 }]}>
          <Text style={styles.textfpc1}>
            Report a violation 
          </Text>
          <TouchableOpacity style={styles.reporticon}>
            <Ionicons name="arrow-forward-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.userfpc1, { width: w * 0.95 }]}>
          <Text style={styles.textfpc1}>
            Pay a citizen 
          </Text>
          <TouchableOpacity style={styles.reporticon}>
            <Ionicons name="arrow-forward-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.userfpc1, { width: w * 0.95 }]}>
          <Text style={styles.textfpc1}>
            Check status of my report
          </Text>
          <TouchableOpacity style={styles.reporticon}>
            <Ionicons name="arrow-forward-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>


    </View>
  );
};

export default Home;

