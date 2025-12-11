import React from "react";
import {Form, Input, Button, badge} from "@heroui/react";
import { Link } from "react-router-dom";

export default function FormularioNoteGym() {

  return (
    <Form
      className="w-full max-w-xs flex flex-col gap-4"
      
    >
      <Input
        isRequired
         errorMessage={
            <span style={{ color: "red" }}>
            Por favor introduce un nombre de usuario válido
            </span>
        }
        
        label="Nombre de usuario"
        labelPlacement="outside"
        name="username"
        placeholder="Introduce tu nombre de usuario"
        type="text"
      />

      <Input
        isRequired
        errorMessage={
            <span style={{ color: "red" }}>
            Por favor introduce un email válido
            </span>
        }
        label="Email"
        labelPlacement="outside"
        name="email"
        placeholder="Introduce tu email"
        type="email"
      />
      <div className="flex gap-2">
        <Button style={{backgroundColor: "#7FDA25"}} type="submit">
          Enviar
        </Button>
        <Button style={{backgroundColor:"#eae3e3ff"}} type="reset" variant="flat">
          Borrar
        </Button>
      </div>
      <div> 
        <Button as={Link} 
        
        to="/newUserGym"
        style={{backgroundColor: "#05E1FA"}} className="" >
          Registrate aquí
        </Button>
      </div>
      
    </Form>
  );
}

