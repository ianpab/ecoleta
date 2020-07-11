import React , { useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import './style.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import Dropzone from '../../components/Dropzone';


interface Item{
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string

}

const CreatePoint = () => {

    const [ items, setItems] = useState<Item[]>([]);
    const [ uf, setUFs] = useState<string[]>([]);
    const [ cities, setCities] = useState<string[]>([]);
    const [ selectedFile, setSelectedFile] = useState<File>();

    const [ selectedUF, setSelectedUF] = useState('0');
    const [ selectedCity, setSelectedCity] = useState('0');
    const [ selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [ selectedItems, setSelectedItems] = useState<number[]>([])
    const [ formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const history = useHistory();

    useEffect(() => {
        api.get('items').then(response => {
           setItems(response.data);
        });
    },[]);

    useEffect(() => {
       axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
       const UFInitials = response.data.map(uf => uf.sigla );    
        setUFs(UFInitials);
       });
    },[]);

    useEffect(() => {
        if(selectedUF === '0'){
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?orderBy=nome`).then(response =>{
        const cityName = response.data.map(city => city.nome );   
        setCities(cityName);
        
            });
     },[selectedUF]); //quando o valor for alterado executa useEffect

    //Change para o select de estados
 function handleSelectUf(event : ChangeEvent<HTMLSelectElement>){
     const uf = event.target.value;
     setSelectedUF(uf);
 }

 function handleSelectCity(event : ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
    setSelectedCity(city);
}

function handleInputChange(event : ChangeEvent<HTMLInputElement>){
    const { name, value} = event.target;
    setFormData({ ...formData, [name]: value })
}

function handleSelectedItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if(alreadySelected >= 0){
        const filteredItems = selectedItems.filter(item => item !== id)
        setSelectedItems(filteredItems);
    } else{
        setSelectedItems([...selectedItems, id]);
    }
}

function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
        event.latlng.lat,
        event.latlng.lng
    ]);
}

async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const { name, email, whatsapp} = formData;
    const uf = selectedUF;
    const city= selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();
    
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    
    if(selectedFile){
        data.append('image', selectedFile);
    }
    
    await api.post('points', data);
    alert('Ponto cadastrado com sucesso!');
    history.push('/');
}


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/"><FiArrowLeft />Voltar para Home</Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="text" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[-23.0448777,-45.5778174]} zoom={8} onClick={handleMapClick}> 
                    <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select onChange={handleSelectUf} value={selectedUF} name="uf" id="uf">
                            <option value="0">Selecione um estado</option>
                                {uf.map(estado =>(
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                                <option value="0">Selecione um cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        { items.map( item =>(
                            <li 
                            key={item.id}
                            onClick={() => handleSelectedItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : '' } >
                                <img src={item.image_url} alt={item.title}/>
                        <span>{item.title}</span>
                        </li>
                        ))}
                        
                       
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;