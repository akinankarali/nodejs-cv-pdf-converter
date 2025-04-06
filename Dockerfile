FROM node:18-slim

# Chrome bağımlılıklarını kur
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini oluştur
WORKDIR /app

# Uygulama bağımlılıklarını kopyala ve yükle
COPY package*.json ./
RUN npm install

# Uygulama kaynak kodlarını kopyala
COPY . .

# Geçici dizin oluştur
RUN mkdir -p ./temp

# Port'u dışa aç
EXPOSE 3001

# Uygulamayı başlat
CMD ["node", "index.js"] 