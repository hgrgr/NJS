module.exports=(sequelize,DataTypes)=>(//사용자에게 키를 발급해주는 db
    sequelize.define('domain',{
        host: {//도메인 등록
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        type: {// 유무료
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        clientSecret: { //비밀코드
            type: DataTypes.STRING(40),
            allowNull: false,
        },
    },{
            validate: {//추가 제약조건?
                unknownType() {
                    if(this.type !=='free' && this.type !== 'premium'){
                        throw new Error('type 컬럼은 free or premium');
                    }
                },
            },
    timestamps: true,
    paranoid: true,
})
);