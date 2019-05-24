import { StyleSheet, Dimensions } from 'react-native';
import { Metrics, ApplicationStyles } from '../../Themes/';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    paddingBottom: Metrics.baseMargin
  },
  logo: {
    marginTop: Metrics.doubleSection,
    resizeMode: 'contain'
  },
  centered: {
    alignItems: 'center'
  },
  transcript: {
    textAlign: 'center',
    color: '#000',
    paddingBottom: 20
  },
  readingTranscript: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffba00',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
  },
  webview: {
    flex: 1,
    backgroundColor: 'yellow',
    width: deviceWidth,
    height: deviceHeight
  }
})
