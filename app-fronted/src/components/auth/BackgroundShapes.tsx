import { Box } from "@mui/material";

const BackgroundShapes = () => {

    return (

        <>

            {/* Cercles lumineux */}

            <Box
                sx={{
                    position: "absolute",
                    top: -180,
                    right: -180,
                    width: 420,
                    height: 420,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(25,118,210,.12) 0%, rgba(25,118,210,0) 75%)",
                    zIndex: 0,
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    bottom: -250,
                    left: -250,
                    width: 700,
                    height: 700,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(13,71,161,.08) 0%, rgba(13,71,161,0) 75%)",
                    zIndex: 0,
                }}
            />

            {/* Vagues du bas */}

            <Box
                sx={{
                    position: "absolute",
                    bottom: -140,
                    left: "-5%",
                    width: "110%",
                    height: 350,
                    borderTopLeftRadius: "50%",
                    borderTopRightRadius: "50%",
                    background:
                        "linear-gradient(180deg, rgba(25,118,210,.05), rgba(25,118,210,.15))",
                    transform: "rotate(-2deg)",
                    zIndex: 0,
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    bottom: -190,
                    left: "-8%",
                    width: "115%",
                    height: 380,
                    borderTopLeftRadius: "50%",
                    borderTopRightRadius: "50%",
                    background:
                        "linear-gradient(180deg, rgba(13,71,161,.03), rgba(13,71,161,.08))",
                    transform: "rotate(2deg)",
                    zIndex: 0,
                }}
            />

            {/* Points décoratifs */}

            <div className="dots top-right" />

            <div className="dots bottom-left" />

            <div className="dots bottom-right" />

            {/* Croix médicales */}

            <div className="cross left">+</div>

            <div className="cross right">+</div>

        </>

    );

};

export default BackgroundShapes;