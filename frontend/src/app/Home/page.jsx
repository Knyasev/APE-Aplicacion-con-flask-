//nspage
'use client';

import { all_person } from "@/hooks/Services_person";
import Cookies from 'js-cookie';
import Menu from "../components/menu";
import { useState } from 'react';
import middleware from "../components/mildware";
function Home() {
  const [menuVisible, setMenuVisible] = useState(false);

  /*let token = Cookies.get('token');

  all_person(token).then((info) => {
    console.log(info);
      });
  */
      const dashboardStyle = {
        paddingLeft: '300px' , // Ajusta el padding si el menú está visible
      };
  return (
    <>
    <div style={{dashboardStyle}}>
      <Menu></Menu>
    <div style={dashboardStyle}>
      </div>
    <h1>Bienvido</h1>
       
      </div>
    </>
  )
}
export default middleware(Home);