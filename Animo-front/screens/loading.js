import { View, Text,Dimensions } from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress';

var { width, height } = Dimensions.get('window');
export default function loading() {
  return (
    <View style={{height,width}} className="absolute flex-row  justify-center items-center bg-[#262626]">
      <Progress.CircleSnail thickness={12} size={120} color="#5abf75" />     
      </View>
  )
}