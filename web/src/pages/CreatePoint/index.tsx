import React , { useEffect, useState, ChangeEvent} from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';

import './style.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';


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

    const [ selectedUF, setSelectedUF] = useState('0');
    const [ selectedCity, setSelectedCity] = useState('0');


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
        console.log(cityName);
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

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/"><FiArrowLeft />Voltar para Home</Link>
            </header>

            <form>
                <h1>Cadastro do<br /> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome</label>
                        <input type="text" name="name" id="name"/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="text" name="email" id="email"/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp"/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[-23.0448777,-45.5778174]} zoom={15}>
                    <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[-23.0448777,-45.5778174]} />
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
                            <li key={item.id}><img src={item.image_url} alt={item.title}/>
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