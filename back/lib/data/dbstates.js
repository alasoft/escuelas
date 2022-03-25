class DbStates {

    static Active = 1;
    static Inactive = 0;
    static Deleted = -1;

    static All = [this.Active, this.Inactive, this.Deleted];

}

module.exports.DbStates = DbStates;