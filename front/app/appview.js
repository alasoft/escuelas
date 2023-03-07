class AppView extends AppViewBase {

    toolbarItems() {
        return super.toolbarItems().concat([this.userButton()])
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
                    }
                })
            }
        })

        itemDatos.addChild({
            text: "Escuelas",
            onClick: e => Escuelas.Render()
        })

        itemDatos.addChild({
            text: "Modalidades",
            onClick: e => Modalidades.Render()
        })

        itemDatos.addChild({
            text: "Materias",
            onClick: e => Materias.Render()
        })

        itemDictado.addChild({
            text: "Cursos",
            onClick: e => new Cursos().render()
        })

        itemDictado.addChild({
            text: "Dias y horas de Materias",
            onClick: e => new Horas().render()
        })

        itemDictado.addChild({
            text: "Alumnos",
            onClick: e => new AlumnosCurso().render()
        })

        itemEvaluaciones.addChild({
            text: "Períodos",
            onClick: e => new Periodos().render()
        })

        itemEvaluaciones.addChild({
            text: "Trabajos Prácticos",
            onClick: e => new Tps().render()
        })

        itemEvaluaciones.addChild({
            text: "Notas",
            onClick: e => new Evaluaciones().render()
        })

        return [itemDatos, itemDictado, itemEvaluaciones, itemSalida];

    }

}