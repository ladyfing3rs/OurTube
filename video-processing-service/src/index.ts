import express from "express";

import {
	uploadProcessedVideo,
	downloadRawVideo,
	deleteRawVideo,
	deleteProcessedVideo,
	convertVideo,
	setupDirectories
} from './storage';

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
	// Get the path of the input vid file
	let data;
	try{
		const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
		data = JSON.parse(message);
		if(!data.name){
			throw new Error('Invalid message payload received');
		}
	} catch(erro){
		console.error(error);
		return res.status(400).send('Bad Request: missing filename.');
	}

	const inputFilePath = data.name;
	const outputFilePath = `processed-${inputFileName}`;

	await downloadRawVideo(inputFileName);

	try{
		await convertVideo(inputFileName, outputFileName)
	} catch(err){
		await Promise.all([
			deleteRawVideo(inputFileName),
			deleteProcessedVideo(outputFileName)
		]);
		return res.status(500).send('Processing failed');
	}
	
	await uploadProcessedVideo(outputFileName);

	await Promise.all([
		deleteRawVideo(inputFileName),
		deleteProcessedVideo(outputFileName)
	]);
	
	return res.status(200).send('Success');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
