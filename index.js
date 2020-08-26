/**
 * @format
 */

import { Navigation } from "react-native-navigation";
import App from './App';
import LiveRoom from './src/page/liveRoom';



Navigation.registerComponent('Home', () => App);
Navigation.registerComponent('LiveRoom', () => LiveRoom);

Navigation.events().registerAppLaunchedListener(() => {
       Navigation.setRoot({
             root: {
               stack: {
                     children: [
                           {
                             component: {
                               name: 'Home'
                             }
                       }
                     ]
                   }
             }
      });
    });
