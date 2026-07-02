module.exports = [
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                test: "readonly",
                expect: "readonly",
                module: "readonly",
                require: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "error",
            "no-undef": "error"
        }
    }
];
