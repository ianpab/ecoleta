import React from 'react';
// propriedades
interface HeaderProps{
    title: string; // title? nao obrigatorio
}

//function Header(){
const Header: React.FC<HeaderProps> = (props) =>{
    return (
        <header>
        <p>{props.title}</p>
        </header>
    );
}

export default Header;