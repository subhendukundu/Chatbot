import React, { Component, createRef } from 'react';
import { ScrollView, Text, Image, TouchableOpacity, Platform, View, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Images } from '../Themes'
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';

export default class VoiceIos extends Component {
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
      responseJson: {},
      pageToShow: 'https://www.jeep.com/grand-cherokee.html'
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
      const dataToReq = {
        "conversation": this.state.results
      }
      /* fetch('http://demo8648157.mockable.io/test').then(response => response.json())
      .then((responseJson)=> {
        console.log(responseJson);
        this.setState({
          responseJson
        })
      }); */
      fetch('http://127.0.0.1:9090/convprocessor/api/getpagepath/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToReq)
      }).then(response => response.json()).then(res => {
        console.log(res);
        const { data: [ details = {} ] } = res;
        const { url, description } = details;
        console.log('got url', url, description)
        Tts.getInitStatus().then(() => {
          Tts.speak(description || `Sorry, couldn't find any results`);
        });
        if (url) {
          this.setState({
            pageToShow: url
          })
        }
      }).catch(err => {
        console.log(err);
        this._startRecognition();
      })
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
  }
  onSpeechResults = (e) => {
    console.log('onSpeechResults', e);
    Animated.timing(this.state.animatedWidth, {
      duration: 300,
      toValue: 150
    }).start();
    this.silentVoiceStop();
    
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
    };
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
    const { isAnimatingAudio, results, responseJson, pageToShow } = this.state;
    console.log(isAnimatingAudio, results);
    const { styles } = this.props;
    return (
      <View style={styles.mainContainer}>
        <WebView
          style={styles.webview}
          source={{ uri: pageToShow }}
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
