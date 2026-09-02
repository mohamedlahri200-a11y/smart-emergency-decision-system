


import { createTheme } from "@mui/material/styles";

const loginTheme = createTheme({

    palette: {

        mode: "light",

        primary: {

            main: "#0D47A1",

            light: "#1976D2",

            dark: "#08306B",

            contrastText: "#FFFFFF"

        },

        secondary: {

            main: "#1565C0"

        },

        background: {

            default: "#F5F8FD",

            paper: "#FFFFFF"

        },

        text: {

            primary: "#102A43",

            secondary: "#5C6B80"

        },

        success: {

            main: "#2E7D32"

        },

        error: {

            main: "#D32F2F"

        }

    },



    typography: {

        fontFamily: [

            "Inter",

            "Segoe UI",

            "Roboto",

            "Helvetica",

            "Arial",

            "sans-serif"

        ].join(","),



        h1: {

            fontWeight: 900,

            fontSize: "4rem",

            color: "#0D47A1",

            letterSpacing: 1

        },



        h2: {

            fontWeight: 800,

            color: "#0D47A1"

        },



        h3: {

            fontWeight: 800

        },



        h4: {

            fontWeight: 700

        },



        h5: {

            fontWeight: 700

        },



        h6: {

            fontWeight: 700

        },



        body1: {

            fontSize: "1rem"

        },



        body2: {

            color: "#5C6B80"

        }

    },



    shape: {

        borderRadius: 18

    },



    components: {

        MuiPaper: {

            styleOverrides: {

                root: {

                    borderRadius: 28,

                    boxShadow:

                        "0 20px 60px rgba(0,0,0,.10)"

                }

            }

        },



        MuiButton: {

            styleOverrides: {

                root: {

                    borderRadius: 14,

                    textTransform: "none",

                    fontWeight: 700,

                    fontSize: "1rem",

                    paddingTop: 14,

                    paddingBottom: 14,

                    transition: ".3s"

                },



                contained: {

                    background:

                        "linear-gradient(90deg,#1565C0,#0D47A1)",

                    boxShadow:

                        "0 12px 25px rgba(21,101,192,.30)",

                    "&:hover": {

                        transform: "translateY(-2px)",

                        boxShadow:

                            "0 15px 35px rgba(21,101,192,.40)"

                    }

                }

            }

        },



        MuiOutlinedInput: {

            styleOverrides: {

                root: {

                    borderRadius: 14,

                    background: "#FFFFFF",

                    transition: ".25s",



                    "&:hover": {

                        background: "#FAFCFF"

                    },



                    "&.Mui-focused": {

                        background: "#FFFFFF"

                    }

                }

            }

        },



        MuiCheckbox: {

            styleOverrides: {

                root: {

                    color: "#1565C0"

                }

            }

        }

    }

});

export default loginTheme;