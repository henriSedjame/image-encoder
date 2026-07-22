build:
	rm -rf assets && rm index.html &&\
	cd code &&\
	bun run build-app && \
	cd .. &&\
	sed -i.bak "s/assets/image-encoder\/assets/g" index.html && rm index.html.bak
