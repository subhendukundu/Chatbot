import React, { Component, createRef } from 'react';
import { ScrollView, Text, Image, TouchableOpacity, Platform, View, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Images } from '../Themes'
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';

export default class VoiceAndroid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recognized: '',
      started: '',
      results: '',
      isAnimatingAudio: false,
      animated: new Animated.Value(0),
      opacityA: new Animated.Value(1),
      animatedWidth: new Animated.Value(50),
      responseJson: {}
    };
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    // Tts.addEventListener('tts-finish', this._startRecognition);
    this.readingTranscript = createRef();
    this.init();
    setTimeout(() => {
      console.log('initing tts -------')
      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.54);
      Tts.addEventListener('tts-finish', this._startRecognition);
    }, 2000);
  }
  componentWillUnmount() {
      Voice.destroy().then(Voice.removeAllListeners);
  }

  init = async (e) => {
    try {
      clearTimeout(window.silenceSetTimeout);
      await Voice.start('en-US');
      Tts.getInitStatus().then(e => {
        console.log('tts ready', e)
      });
    } catch (e) {
      console.error(e);
    }
  }

  onSpeechStart = (e) => {
    console.log('starting now');
    this.setState({
      started: '√',
    });
  };
  onSpeechRecognized = (e) => {
    console.log('onSpeechRecognized', e)
    this.setState({
      recognized: '√',
    });
  };
  onSpeechVolumeChanged = (e) => {
    console.log(e.value);
  }

  onSpeechPartialResults = (e) => {
    console.log('onSpeechPartialResults', e)
  }

  onSpeechEnd = (e) => {
    console.log('onSpeechEnd', e);
  }
  onSpeechResults = (e) => {
    console.log('onSpeechResults', e);
    Tts.speak('Hello, world!');
  }

  _startRecognition = async (e) => {
    console.log(e)

    try {
      clearTimeout(window.silenceSetTimeout);
      await Voice.start('en-US');
    } catch (err) {
      console.error(err);
    }
  }

  _stopRecognition = async (e) => {
    console.log('_stopRecognition')
    this.setState({
        recognized: '',
        started: '',
        results: [],
        isAnimatingAudio: false
    })
  }

  _micButton() {
    const { isAnimatingAudio, animated, opacityA, } = this.state;
    //some function
    this._runAnimation();
    return (
      <Animated.View style={{
          width: 80,
          height: 80,
          borderRadius: 50,
          backgroundColor: 'rgba(153,0,0,0.4)',
          opacity: opacityA,
          transform: [
              {
                  scale: animated
              }
          ]
      }}>
      </Animated.View>
    );
  }
  render () {
    const { isAnimatingAudio, results, responseJson } = this.state;
    const { styles } = this.props;
    console.log(isAnimatingAudio, results);
    Voice.isAvailable().then(e => {
      console.log(e)
    }).catch(err => console.log(err))
    return (
      <View style={styles.mainContainer}>
        <WebView
          style={styles.webview}
          source={{ uri: responseJson.html ? 'https://www.alfaromeousa.com/suvs/stelvio#offers' : 'https://www.alfaromeousa.com/suvs/stelvio' }}
        />
        <Animated.View style={[styles.readingTranscript, !isAnimatingAudio && { justifyContent:'flex-end' }, isAnimatingAudio && {justifyContent: 'space-between', paddingTop: 10}, { height : this.state.animatedWidth }]} ref={this.readingTranscript}>
          {isAnimatingAudio ? this._micButton() : null}
          <Text style={styles.transcript}>
            {isAnimatingAudio ? results ? results : 'Listening...' : 'How can I help you?'}
          </Text>
        </Animated.View>
      </View>
    )
  }
}
