class Item {

    static Id() {
        return {
            dataField: "id",
            visible: false
        }
    }

    static DataField(p = {}) {

        function dataField() {
            return {
                dataField: p.dataField,
                isRequired: p.required == true,
                visible: p.visible,
                colSpan: p.colSpan,
                label: {
                    text: p.label,
                }
            }
        }

        function editorOptions() {
            return {
                editorOptions: {
                    showClearButton: p.clearButton == true,
                    inputAttr: {
                        class: p.cssInput || App.FONT_INPUT
                    },
                    width: p.width,
                    value: p.value,
                    placeholder: p.placeholder,
                    onValueChanged: p.onValueChanged,
                }
            }
        }

        function readOnly() {
            if (p.readOnly == true) {
                return {
                    editorOptions: {
                        readOnly: true,
                        focusStateEnabled: false,
                        inputAttr: {
                            class: p.cssInput || App.FONT_READ_ONLY
                        }
                    }
                }
            }
        }

        return Utils.Merge(dataField(), editorOptions(), readOnly())

    }

    static Text(p = {}) {

        function text() {
            return {
                editorType: "dxTextBox",
            }
        }

        function upperCase() {
            if (p.case == "upper") {
                return {
                    editorOptions: {
                        inputAttr: {
                            style: "text-transform: uppercase"
                        },
                        onValueChanged: e => e.value ? e.component.option("value", e.value.toUpperCase()) : undefined
                    }
                }
            }
        }

        return Utils.Merge(this.DataField(p), text(), upperCase())
    }

    static Number(p = {}) {

        function number() {
            return {
                editorType: "dxNumberBox",
                editorOptions: {
                    format: p.format || App.NUMBER_FORMAT,
                    width: p.width || App.NUMBER_WIDTH,
                    min: p.min,
                    max: p.max,
                    showSpinButtons: p.spin == true,
                    inputAttr: {
                        style: "text-align: right"
                    }
                }
            }
        }

        return Utils.Merge(this.DataField(p), number())
    }

    static DateLong(p = {}) {

        function date() {
            return {
                editorOptions: {
                    displayFormat: p.format || App.DATE_FORMAT_LONG,
                    width: p.width || App.DATE_WIDTH_LONG
                }
            }
        }
        return Utils.Merge(this.Date(p), date())
    }

    static Date(p = {}) {

        function date() {
            return {
                editorType: "dxDateBox",
                editorOptions: {
                    type: p.type || "date",
                    displayFormat: p.format || App.DATE_FORMAT,
                    useMaskBehavior: true,
                    applyValueMode: "instantly",
                    calendarOptions: {
                        showTodayButton: true
                    },
                    width: p.width || App.DATE_WIDTH
                }
            }
        }

        return Utils.Merge(this.DataField(p), date())

    }

    static Time(p = {}) {

        function time() {
            return {
                editorOptions: {
                    type: "time",
                    displayFormat: App.TIME_FORMAT,
                    width: App.TIME_WIDTH,
                }
            }
        }

        return Utils.Merge(this.Date(p), time())
    }

    static Lookup(p = {}) {

        function lookup() {
            return {
                editorType: "dxSelectBox",
                editorOptions: {
                    dataSource: p.dataSource,
                    displayExpr: p.displayExpr || App.DISPLAY_EXPR,
                    valueExpr: "id",
                    searchEnabled: p.editable == true,
                    deferRendering: p.deferRendering,
                    buttons: p.extraButton != undefined ? ["dropDown", p.extraButton] : undefined,
                    onSelectionChanged: p.onSelectionChanged
                }
            }
        }

        return Utils.Merge(this.DataField(p), lookup());

    }

    static Button(p = {}) {
        return {
            itemType: "button",
            horizontalAlignment: p.align,
            buttonOptions: {
                text: p.text,
                onClick: p.onClick,
                icon: p.icon,
                type: p.type,
                width: p.width,
                focusStateEnabled: false,
                hint: p.hint
            }
        }
    }

    static Check(p = {}) {

        function check() {
            return {
                editorType: "dxCheckBox",
                editorOptions: {
                    onValueChanged: e => e.component.option("value", e.value == true ? 1 : 0)
                }
            }
        }

        return Utils.Merge(this.DataField(p), check())
    }

    static Group(p = {}) {
        return Utils.Merge({
            itemType: "group"
        }, p)
    }

    static Space() {
        return ({ itemType: "empty" })
    }

    static Apellido(p = {}) {
        return this.Text(Utils.Merge({
            dataField: "apellido",
            required: true
        }, p))
    }

    static Nombre(p = {}) {
        return this.Text(Utils.Merge({
            dataField: "nombre",
            required: true
        }, p))
    }

    static Email(p = {}) {
        return {
            dataField: p.dataField || "email",
            isRequired: p.required == true,
            editorOptions: {
                showClearButton: p.clearButton == true,
                mode: "email",
                width: p.width || App.EMAIL_WIDTH,
                inputAttr: {
                    autocomplete: "on"
                }
            },
        }
    }

    static RepeatEmail(p = {}) {
        return {
            dataField: p.dataField || "repeatEmail",
            isRequired: p.required || true,
            label: {
                text: p.text || "Repite el Email"
            },
            editorOptions: {
                width: p.width || App.EMAIL_WIDTH,
            }
        }
    }

    static Password(p = {}) {
        return {
            dataField: p.dataField || "password",
            isRequired: p.required || true,
            editorOptions: {
                mode: "password",
                width: p.width || 150,
            }
        }
    }

    static RepeatPassword(p = {}) {
        return {
            dataField: p.dataField || "repeatPassword",
            isRequired: p.required || true,
            label: {
                text: p.text || "Repite el password"
            },
            editorOptions: {
                mode: "password",
                width: p.width || 150,
            }
        }
    }

    static ToglePassword(p = {}) {
        return {
            dataField: p.dataField || "showPassword",
            editorType: "dxCheckBox",
            label: {
                text: p.text || "Muestra el password"
            },
            editorOptions: {
                onValueChanged: p.onClick || (e => Utils.Evaluate(p.form).toglePassword("password"))
            }
        }
    }

    static RecoverPassword(p = {}) {
        return {
            itemType: "button",
            buttonOptions: {
                visible: p.visible,
                text: p.text || "Olvidé el password",
            }
        }
    }

    static ReadOnly(p = {}) {
        p.readOnly = true;
        return this.Text(p)
    }

}