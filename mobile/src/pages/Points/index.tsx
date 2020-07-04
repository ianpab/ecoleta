import React, { useState, useEffect} from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image, SafeAreaView, Alert} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation} from '@react-navigation/native';
import MapView, { Marker} from 'react-native-maps';
import { SvgUri} from 'react-native-svg';
import api from '../../services/api';
import * as Location  from 'expo-location';

interface Item{
  id: number,
  title: string,
  image_url: string,
}

interface Point{
  id: number;
  image: string;
  name: string;
  latitude: number;
  longitude: number;
}

const Point = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ selectedItems, setSelectedItems] = useState<number[]>([]);
    const [ initialPosition, setInitialPosition] = useState<[number, number]>([0 ,0 ]);
    const [ points, setPoints] = useState<Point[]>([]);

    const navigation = useNavigation();

    useEffect(() => {
      api.get('items').then(response => {
          setItems(response.data);
      })
    },[]);

    useEffect(() => {
      api.get('points', {
        params:{
          city: 'Taubate',
          uf: 'SP',
          items: [5],
        }
      }).then(response => {
        setPoints(response.data);
      })
    }, []);

    useEffect(() => {
    async  function loadPosition(){
        const { status } = await Location.requestPermissionsAsync();

        if( status !== 'granted'){
          Alert.alert('Opps...', 'É necessário a permissão para usar a função.');
          return;
        } 
        const location = await Location.getCurrentPositionAsync();

        const { latitude, longitude} = location.coords;

        setInitialPosition([latitude, longitude]);
      }

      loadPosition();
    }, []);

    function handleSelectedItem(id: number){
      const alreadySelected = selectedItems.findIndex(item => item === id);
  
      if(alreadySelected >= 0){
          const filteredItems = selectedItems.filter(item => item !== id)
          setSelectedItems(filteredItems);
      } else{
          setSelectedItems([...selectedItems, id]);
      }
  }

    function handleNavigatorToBack(){
        navigation.goBack();
    }

    function handleNavigatorToDetail(id: number){
      navigation.navigate('Detail', {point_id: id});
  }

    return (
    <SafeAreaView style={{flex:1}}>
        <View style={styles.container}> 
            <TouchableOpacity onPress={handleNavigatorToBack}> 
            <Icon name="arrow-left" color="#34cb79" size={20}></Icon>
            </TouchableOpacity>   
            <Text style={styles.title}>Bem vindo.</Text>   
            <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>   

              {initialPosition[0] !== 0 && (
                <View style={styles.mapContainer}>
                <MapView 
                style={styles.map}
                loadingEnabled={initialPosition[0] === 0}
                initialRegion={{
                    latitude: initialPosition[0],
                    longitude: initialPosition[1],
                    latitudeDelta:0.080,
                    longitudeDelta:0.080,
                }}>
                    {points.map(point => (
                      <Marker
                      key={String(point.id)}
                      onPress={() => handleNavigatorToDetail(point.id)}
                      coordinate={{
                          latitude: point.latitude,
                          longitude: point.longitude
                      }}>
                          <View style={styles.mapMarkerContainer}>
                          <Image style={styles.mapMarkerImage} source={{uri:point.image}}></Image>
                          <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                          </View>
                      </Marker>
                    ))}
                </MapView>
            </View> 
              )} 
        </View>
        <View style={styles.itemsContainer}>
            <ScrollView 
            alwaysBounceHorizontal={false}
            horizontal
            contentContainerStyle={{ paddingHorizontal: 20}}>

                {items.map(item => (
                  <TouchableOpacity 
                  key={String(item.id) } 
                  style={[
                    styles.item,
                    selectedItems.includes(item.id) ? styles.selectedItem : {},
                  ]} 
                  onPress={() => handleSelectedItem(item.id)}
                  activeOpacity={0.6}>
                  <SvgUri uri={item.image_url} width={42} height={42} />
                <Text style={styles.itemTitle}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    </SafeAreaView>

    );
};

export default Point;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });
  

