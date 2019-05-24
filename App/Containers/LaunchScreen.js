import React, { Component, createRef } from 'react';
import { ScrollView, Text, Image, Button, Platform, View, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Images } from '../Themes'
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
import * as Animatable from 'react-native-animatable';
// Styles
import styles from './Styles/LaunchScreenStyles'

export default class LaunchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recognized: '',
      started: '',
      results: '',
      isAnimatingAudio: false,
      animated: new Animated.Value(0),
      opacityA: new Animated.Value(1),
      responseJson: {}
    };
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Tts.addEventListener('tts-finish', this._startRecognition);
    this.readingTranscript = createRef();
    this.init();
  }
  componentWillUnmount() {
      Voice.destroy().then(Voice.removeAllListeners);
  }

  init = async (e) => {
    try {
      clearTimeout(window.silenceSetTimeout);
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  }

  onSpeechStart(e) {
    this.setState({
      started: '√',
    });
  };
  onSpeechRecognized(e) {
    console.log('onSpeechRecognized', e)
    this.setState({
      recognized: '√',
    });
    if (e.isFinal) {
      fetch('http://demo8648157.mockable.io/test').then(response => response.json())
      .then((responseJson)=> {
        console.log(responseJson);
        this.setState({
          responseJson
        })
      });
      Tts.getInitStatus().then(() => {
        Tts.speak(this.state.results);
      });
    }
  };

  onSpeechPartialResults(e) {
    console.log('onSpeechPartialResults', e)
  }

  silenceCheck() {
    this._stopRecognition();
  }
  silentVoiceStop() {
    clearTimeout(window.silenceSetTimeout);
    window.silenceSetTimeout = setTimeout(()=>{ this.silenceCheck() }, 2000);
  }

  _runAnimation() {
    const { animated, opacityA } = this.state;

    Animated.loop(
        Animated.parallel([
            Animated.timing(animated, {
                toValue: 1,
                duration: 1000,

            }),
            Animated.timing(opacityA, {
                toValue: 0,
                duration: 1000,

            })
        ])
    ).start();
  }
  _stopAnimation() {
      Animated.loop(
          Animated.parallel([
              Animated.timing(animated),
              Animated.timing(opacityA)
          ])
      ).stop();
  }

  onSpeechEnd(e) {
    console.log('onSpeechEnd', e);
    this.readingTranscript.current.transitionTo({ height: 50 });
    this.setState(
      state => ({
        recognized: '',
        started: '',
        results: '',
        isAnimatingAudio: false
      })
    );
  }
  onSpeechResults(e) {
      console.log('onSpeechResults', e);
      this.readingTranscript.current.transitionTo({ height: 150 });
      if (Platform.OS === 'ios') {
        this.silentVoiceStop();
      }
      this.setState({
        results: e.value[0],
        isAnimatingAudio: true
      }, () => {
        /* Tts.getInitStatus().then(() => {
          Tts.speak('Hello world');
        }); */
      });
  }
  _startRecognition = async (e) => {
    // this.readingTranscript.current.transitionTo({ height: 150 });
    this.setState(
      state => ({
        recognized: '',
        started: '',
        results: '',
        //isAnimatingAudio: true
      }),
    );
    try {
      clearTimeout(window.silenceSetTimeout);
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  }

  async _stopRecognition(e) {
    console.log('_stopRecognition')
    this.setState(
      state => ({
        recognized: '',
        started: '',
        results: []
      })
    );
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
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
    const { isAnimatingAudio, results, responseJson, } = this.state;
    const injectHtml = `
      <!DOCTYPE html>
      <html lang="en-US">
        <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
          <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport"/> 
          <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible"/>
          <link rel="canonical" href="https://www.jeep.com/grand-cherokee.html"/>
          <meta name="keywords" content="jeep grand cherokee, jeep cherokee, 2019 jeep grand cherokee, 2019 grand cherokee, luxury suv, grand cherokee, cherokee, full size suv"/> 
          <meta name="description" content="The 2019 Jeep ® Grand Cherokee is raising the bar in luxury, and performance. Get premium comfort in the new benchmark for SUV&#39;s."/> 
          <meta name="pageName" content="landing"/> 
          <meta name="pageType" content="vehiclepage"/> 
          <meta name="siteLocator"/>
          <meta name="selectors"/>
          <meta name="brand" content="jeep"/>
          <meta name="modelYear" content="2019"/> 
          <meta name="vehicle" content="grand_cherokee"/> 
          <meta name="vehiclePage" content="grand_cherokee"/> 
          <meta name="modelYearCode" content="CUJ201903"/> 
          <meta name="vehicleModelCode" content="03"/>
          <meta name="pageTemplate" content="include-page"/>
          <meta name="pageVersion" content="1"/>
          <link rel="stylesheet" href="https://www.jeep.com/etc/designs/fca-brands/clientlibs/jeep/base.css" type="text/css">    
          <link rel="stylesheet" href="https://www.jeep.com/etc/designs/fca-brands/clientlibs/jeep/global.css" type="text/css">   
          <link rel="stylesheet" href="https://www.jeep.com/etc/designs/fca-brands/clientlibs/jeep/fonts.css" type="text/css">
          <link rel="stylesheet" href="https://www.jeep.com/etc/designs/fca-brands/clientlibs/jeep/async/runtime.css" type="text/css">
          <link href="${responseJson.css}" rel="stylesheet" type="text/css">

          <noscript><p>Enable JS</p></noscript>
        </head>
        <body style="height: auto;">
          ${responseJson.html}
          <script type="text/javascript" src="https://www.jeep.com/etc/designs/fca-brands/clientlibs/react/runtime.js"></script>
        </body>
      </html>
    `;
    console.log(injectHtml);
    return (
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container}>
          <WebView
            style={styles.webview}
            source={{html: injectHtml}}
            originWhitelist={['*']}
          />
        </ScrollView>
        <Animatable.View style={[styles.readingTranscript, !isAnimatingAudio && { justifyContent:'flex-end' }, isAnimatingAudio && {justifyContent: 'space-between', paddingTop: 10}]} ref={this.readingTranscript}>
          {isAnimatingAudio ? this._micButton() : null}
          <Text style={styles.transcript}>
              {isAnimatingAudio ? results ? results : 'Listening...' : 'How can I help you?'}
          </Text>
        </Animatable.View>
      </View>
    )
  }
}
