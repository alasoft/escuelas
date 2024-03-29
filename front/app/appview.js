class AppView extends AppViewBase {

    toolbarItems() {
        return super.toolbarItems().concat([this.userButton(), this.sistemaButton()])
    }

    userButton() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "user",
                text: "Docente: " + App.UserNombreApellido()
            }
        }
    }

    sistemaButton() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "bell",
                text: App.ShortName()
            }
        }
    }

    itemsDataSource() {

        const itemDatos = new TreeItem({
            id: "1",
            text: "Datos Generales"
        });

        const itemCalificaciones = new TreeItem({
            id: "2",
            text: "Calificaciones"
        });

        const itemDictado = new TreeItem({
            id: "3",
            text: "Clases",
        })

        const itemSalida = new TreeItem({
            id: "4",
            text: "Cierra Sesión",
            onClick: e => {
                App.BlankViewElement();
                App.YesNo({ message: "Cierra la Sesión ?" }).then(data => {
                    if (data.okey) {
                        App.Login()
                    } else {
                        App.SelectFirstItem()
                    }
                })
            }
        })

        itemDatos.addChild({
            text: "Escuelas",
            onClick: e => new Escuelas().render()
        })

        itemDatos.addChild({
            text: "Modalidades",
            onClick: e => new Modalidades().render()
        })

        itemDatos.addChild({
            text: "Materias Genéricas",
            onClick: e => new Materias().render()
        })

        itemDictado.addChild({
            text: "Cursos",
            onClick: e => new Cursos().render()
        })

        /*        
                itemDictado.addChild({
                    text: "Horarios",
                    onClick: e => new MateriasHoras().render()
                })
        */

        itemCalificaciones.addChild({
            text: "Períodos",
            onClick: e => new Periodos().render()
        })

        itemCalificaciones.addChild({
            text: "Valoraciones Pedagógicas",
            onClick: e => new Valoraciones().render()
        })

        itemCalificaciones.addChild({
            text: "Examenes",
            onClick: e => new ExamenesCurso().render()
        })

        itemCalificaciones.addChild({
            text: "Notas",
            onClick: e => new Notas().render()
        })

/*        
        itemCalificaciones.addChild({
            text: "Cursos y Materias",
            onClick: e => new CursosMaterias().render()
        })
*/        

        return [itemDatos, itemDictado, itemCalificaciones, itemSalida];

    }

}