import React, { Component, createRef } from 'react';
import { ScrollView, Text, Image, TouchableOpacity, Platform, View, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Images } from '../Themes'
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
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
      animatedWidth: new Animated.Value(50),
      responseJson: {}
    };
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
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
    if (e.isFinal) {
      // Tts.speak(this.state.results);
      // Tts.speak('hello world hello world hello world')
      console.log(this.state.results)
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

  onSpeechVolumeChanged = (e) => {
    console.log(e.value);
  }

  onSpeechPartialResults = (e) => {
    console.log('onSpeechPartialResults', e)
  }

  silenceCheck = () => {
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

  onSpeechEnd = (e) => {
    console.log('onSpeechEnd', e);
    // this.readingTranscript.current.transitionTo({ height: 50 });
    Animated.timing(this.state.animatedWidth, {
      duration: 300,
      toValue: 50
    }).start();
    this.setState(
      state => ({
        recognized: '',
        started: '',
        results: '',
        isAnimatingAudio: false
      })
    );
    if(!Platform.OS === 'ios') {
      this._startRecognition();
    }
  }
  onSpeechResults = (e) => {
      console.log('onSpeechResults', e);
      //this.readingTranscript.current.transitionTo({ height: 150 });
      if(Platform.OS === 'ios') {
        Animated.timing(this.state.animatedWidth, {
          duration: 300,
          toValue: 150
        }).start();
        if(Platform.OS === 'ios') {
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
      } else {
        Animated.timing(this.state.animatedWidth, {
          duration: 300,
          toValue: 50
        }).start();
        this.setState({
            recognized: '',
            started: '',
            results: e.value[0],
            isAnimatingAudio: true
          }, () => {
            this.onSpeechRecognized({
              isFinal: true
            });
          });
      }
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
    console.log('Voice.isAvailable()', Voice.isAvailable())
      Voice.isAvailable().then(async evn => {
        console.log('abbbbb', evn)
        if(!evn) {
          try {
            clearTimeout(window.silenceSetTimeout);
            await Voice.start('en-US');
          } catch (e) {
            console.error(e);
          }
        }
      }).catch(async err => {
        try {
          clearTimeout(window.silenceSetTimeout);
          await Voice.start('en-US');
        } catch (e) {
          console.error(e);
        }
      })
  }

  _stopRecognition = async (e) => {
    console.log('_stopRecognition')
    this.setState({
        recognized: '',
        started: '',
        results: [],
        isAnimatingAudio: false
    })
      try {
        await Voice.stop();
        console.log('stoppppeeedddd')
      } catch (e) {
        console.error(e);
      };  }

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
    console.log(isAnimatingAudio, results)
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
