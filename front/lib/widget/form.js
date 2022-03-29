 class Form extends Widget {

     widgetName() {
         return "dxForm";
     }

     defaultConfiguration() {
         return Utils.Merge(super.defaultConfiguration(), {
             formData: {},
             labelLocation: "left",
             colCount: 1,
         })
     }

     getData() {
         return this.getProperty("formData");
     }

     setData(data) {
         this.setProperty("formData", data);
     }

     updateData(data) {
         this.instance().updateData(data);
     }

     validate() {
         return new Promise(async(resolve, reject) => {
             let validate = this.instance().validate();
             if (validate.status == "pending") {
                 validate = await validate.complete;
             }
             if (validate.isValid) {
                 resolve(true)
             } else {
                 reject({ code: Errors.FORM_VALIDATION })
             }
         })
     }

     getEditor(dataField) {
         return this.instance().getEditor(dataField);
     }

     getEditorProperty(dataField, propertyName) {
         return this.getEditor(dataField).option(propertyName);
     }

     getEditorValue(dataField) {
         return this.getEditor(dataField).option("value");
     }

     getEditorText(dataField) {
         return this.getEditor(dataField).option("text");
     }

     setEditorValue(dataField, value) {
         this.getEditor(dataField).option("value", value);
     }

     setEditorDataSource(dataField, dataSource) {
         this.setEditorValue(dataField, null);
         this.getEditor(dataField).option("dataSource", dataSource);
     }

     setEditorProperties(dataField, properties) {
         this.getEditor(dataField).option(properties);
     }

     focusEditor(dataField) {
         this.getEditor(dataField).focus();
     }

     onLoadedSetFirstValue(dataField) {
         return data =>
             data.length > 0 ? this.setEditorValue(dataField, data[0]) : undefined;
     }

     clearEditorDataSource(dataField) {
         this.setEditorDataSource(dataField, null);
     }

     setItems(items) {
         this.setProperty("items", items);
     }

     toglePassword(dataField) {
         this.setEditorProperties(dataField, {
             mode: this.getEditorProperty(dataField, "mode") == "password" ? "text" : "password"
         })
     }

     toglePasswords(dataFields) {
         dataFields.forEach(
             dataField => this.toglePassword(dataField)
         )
     }

 }

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
                 colSpan: p.colSpan,
                 label: {
                     text: p.label,
                 },
                 editorOptions: {
                     showClearButton: p.clearButton == true,
                     inputAttr: {
                         class: p.cssInput || App.CSS_INPUT_DEFAULT
                     },
                     width: p.width,
                     placeholder: p.placeholder,
                     onValueChanged: p.onValueChanged
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
                             class: p.cssInput || App.CSS_READ_ONLY_DEFAULT
                         }
                     }
                 }
             }
         }

         return Utils.Merge(dataField(), readOnly())

     }

     static Text(p = {}) {

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

         function text() {
             return {
                 editorType: "dxTextBox",
                 editorOptions: {
                     value: p.value
                 }
             }
         }

         return Utils.Merge(this.DataField(p), text(), upperCase())

     }

     static ReadOnly(p = {}) {
         p.readOnly = true;
         return this.Text(p)
     }

     static Date(p) {

         function date() {
             return {
                 editorType: "dxDateBox",
                 editorOptions: {
                     displayFormat: p.format || App.DATE_FORMAT_DEFAULT,
                     useMaskBehavior: true,
                     applyValueMode: "instantly",
                     calendarOptions: {
                         showTodayButton: true
                     },
                     width: p.width || App.DATE_WIDTH_DEFAULT
                 }
             }
         }

         return Utils.Merge(this.DataField(p), date());

     }

     static Lookup(p = {}) {

         function lookup() {
             return {
                 editorType: "dxSelectBox",
                 editorOptions: {
                     dataSource: p.dataSource,
                     displayExpr: p.displayExpr || App.DISPLAY_EXPR_DEFAULT,
                     searchEnabled: p.editable == true,
                     deferRendering: p.deferRendering
                 }
             }
         }

         return Utils.Merge(this.DataField(p), lookup());

     }

     static Apellido(p = {}) {
         return Utils.Merge(this.Text(p), {
             dataField: "apellido",
             isRequired: true
         })
     }

     static Nombre(p = {}) {
         return Utils.Merge(this.Text(p), {
             dataField: "nombre",
             isRequired: true
         })
     }

     static Group(p = {}) {
         return Utils.Merge({
             itemType: "group"
         }, p)
     }

     static Empty() {
         return ({ itemType: "empty" })
     }

     static Button(p) {
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

     static Check(p) {
         return Utils.Merge(
             this.DataField(p), {
                 editorType: "dxCheckBox",
                 editorOptions: {
                     onValueChanged: e => e.component.option("value", e.value == true ? 1 : 0)
                 }
             }
         )
     }

     static Email(p = {}) {
         return {
             dataField: p.dataField || "email",
             isRequired: p.required || true,
             editorOptions: {
                 mode: "email",
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
                 alignment: "right",
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
                 alignment: "right",
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
                 text: p.text || "Olvidé el password",
             }
         }
     }

     static Message(p = {}) {
         return {
             dataField: "message",
             editorType: "dxTextArea",
             label: {
                 visible: false,
             },
             editorOptions: {
                 text: p.text,
                 height: p.height,
                 readOnly: true,
                 focusStateEnabled: false,
                 inputAttr: {
                     class: "-font-message"
                 }
             }
         }
     }

 }