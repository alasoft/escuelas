class AppItems extends View {

    extraConfiguration() {
        return {
            element: App.ItemsElement(),
            components: {
                label: {
                    text: "Opciones"
                },
                treeItems: {
                    dataSource: this.dataSource(),
                    onFocusedRowChanged: e => this.onFocusedRowChanged(e)
                }
            }
        }
    }

    defineTemplate() {
        return Templates.AppItems()
    }

    dataSource() {

        const itemDatos = new TreeItem({
            id: "1",
            text: "Datos"
        });

        const itemEvaluaciones = new TreeItem({
            id: "2",
            text: "Evaluaciones"
        });

        const itemSalida = new TreeItem({
            id: "3",
            text: "Cierra Sesión",
            onClick: e => {
                App.YesNo({ message: "Cierra la Sesión ?" }).then(yes => {
                    if (yes) {
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

        itemEvaluaciones.add({
            text: "Períodos",
            onClick: e => Periodos.Render()
        })

        itemEvaluaciones.add({
            text: "Cursos",
            onClick: e => Cursos.Render()
        })

        return [itemDatos, itemEvaluaciones, itemSalida];

    }

    onFocusedRowChanged(e) {
        if (e.row.data.onClick) {
            e.row.data.onClick();
        } else {
            App.BlankViewElement();
        }
    }

}