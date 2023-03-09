class AppView extends AppViewBase {

    toolbarItems() {
        return super.toolbarItems().concat([this.userButton(), this.sistemaButton()])
    }

    userButton() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "rename",
                text: "Docente: " + App.UserNombreApellido()
            }
        }
    }

    sistemaButton() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "group",
                text: App.ShortName()
            }
        }
    }

    itemsDataSource() {

        const itemDatos = new TreeItem({
            id: "1",
            text: "Datos"
        });

        const itemEvaluaciones = new TreeItem({
            id: "2",
            text: "Evaluaciones"
        });

        const itemDictado = new TreeItem({
            id: "3",
            text: "Dictado",
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
            text: "Materias",
            onClick: e => new Materias().render()
        })

        itemDictado.addChild({
            text: "Cursos",
            onClick: e => new Cursos().render()
        })

        itemDictado.addChild({
            text: "Horarios",
            onClick: e => new Horas().render()
        })

        itemEvaluaciones.addChild({
            text: "Períodos",
            onClick: e => new Periodos().render()
        })

        itemEvaluaciones.addChild({
            text: "Trabajos Prácticos",
            onClick: e => new TpsCurso().render()
        })


        itemEvaluaciones.addChild({
            text: "Calificaciones",
            onClick: e => new Evaluaciones().render()
        })

        return [itemDatos, itemDictado, itemEvaluaciones, itemSalida];

    }

}