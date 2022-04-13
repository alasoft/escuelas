class EvaluacionesDetail extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            popup: {
                visible: true,
                title: this.popupTitle(),
                onHidden: e => {
                    if (this.hasChanged()) {
                        this.evaluacionesView.refresh();
                    }
                }
            }
        })
    }




}