const cheerio = require("cheerio");
const fetch = require("node-fetch").default;
const fs = require("fs").promises;
const path = require("path");
const notifier = require("node-notifier");
const FormData = require("form-data");

async function getPosts(page) {
	const formData = new FormData();
	formData.append("page", page);
	formData.append("userLoggedIn", "");
	formData.append("platform", 1);
	formData.append("category_id", 1);
	formData.append("sort_by", "ORDER BY status ASC, price DESC");
	const request = await fetch(
		"https://www.gamerpower.com/ajax/ajax_load_offers",
		{
			method: "POST",
			body: formData,
			headers: {
				"user-agent":
          "Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0",
			},
		}
	);
	const response = await request.text();
	const $ = cheerio.load(response);
	let data = [];
	$(".col-lg-3.col-md-6").each((_index, element) => {
		const el = $(element);
		let url = el.find(".ml-2.btn.btn-sm.btn-block").attr("href");
		if (url.startsWith("/play/")) return; // ad
		data.push({
			title: el.find(".card-title a").text(),
			description: el.find(".card-text").text(),
			url: `https://www.gamerpower.com${url}`,
			expired: el.find(".expire_stamp").length > 0,
			prevPrice: el.find("span.text-muted s").text(),
		});
	});
	return {
		noMorePosts: $(".noMorePosts")[0].attribs["value"] === "true",
		data,
	};
}

async function main() {
	let allPosts = [];
	for (let page = 1; ; page++) {
		const result = await getPosts(page);
		allPosts = [...allPosts, ...result.data];
		if (result.noMorePosts) break;
	}
	let oldPosts = [];
	try {
		oldPosts = JSON.parse(
			await fs.readFile(path.resolve(__dirname, "allPosts.json"))
		);
	} catch { /**/ }
	for (const post of allPosts) {
		let old = false;
		for (const oldPost of oldPosts) {
			if (oldPost.url === post.url) {
				if (oldPost.expired !== post.expired && post.expired === false) break;
				old = true;
				break;
			}
		}
		if (!old) {
			notifier.notify({
				title: post.title,
				message: post.description,
				sound: true,
			});
		}
	}
	await fs.writeFile(
		path.resolve(__dirname, "allPosts.json"),
		JSON.stringify(allPosts)
	);
}

main();
