import React, { Component, createRef } from 'react';
import { ScrollView, Text, Image, TouchableOpacity, Platform, View, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Images } from '../Themes'
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
import VoiceIos from '../Components/Voice.ios';
import VoiceAndroid from '../Components/Voice.android';
// Styles
import styles from './Styles/LaunchScreenStyles'

export default class LaunchScreen extends Component {
  constructor(props) {
    super(props);
  }

  render () {
    return Platform.OS === 'ios' ? <VoiceIos styles={styles} /> : <VoiceAndroid styles={styles} />;
  }
}
