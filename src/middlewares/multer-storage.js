import multer from "multer";

const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, './public/images');
    },
    filename : function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname.split(".").pop();
        const fileNameWithExtension = `${file.filename}-${uniqueSuffix}.${fileExtension}`;
        cb(null, fileNameWithExtension);
    }
})

const upload = multer({ storage });

export default upload;