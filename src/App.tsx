import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.scss";

import Home from './App/Home'
import List from './App/List'
import AboutUs from './App/AboutUs'

import Tabbar from './App/Tabbar'

import { parse } from './lib/csv-parse-esm'
// You can see config.json after running `npm start` or `npm run build`
import config from './config.json'

const zen2han = (str: string) => {
  return str.replace(/[！-～]/g, function(s: string) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  }).replace(/　/g, ' ');
}

const App = () => {
  const [ shopList, setShopList ] = React.useState<Iemeshi.ShopData[]>([])

  React.useEffect(() => {
    fetch(`https://9sklrm30w6.execute-api.ap-northeast-1.amazonaws.com/v1/proxy?target=${encodeURIComponent(config.data_url)}`)
    .then((response) => {
      return response.ok ? response.text() : Promise.reject(response.status);
    })
    .then((data) => {
      parse(data, async (error: any, data: any) => {
        if (error) {
          console.log(error)
          setShopList([])
          return
        }

        const [header, ...records] = data;

        const features = records.map((record: string) => {
          const properties = header.reduce((prev: any, column: any) => {
            const value = record[header.indexOf(column)];
            prev[column] = zen2han(value);
            return prev;
          }, {});

          return properties;
        });

        const nextShopList: Iemeshi.ShopData[] = []
        for (let i = 0; i < features.length; i++) {
          const feature = features[i] as Iemeshi.ShopData
          if (!feature['緯度'] || !feature['経度'] || !feature['店名']) {
            continue;
          }
          if (!feature['緯度'].match(/^[0-9]+(\.[0-9]+)?$/)) {
            continue
          }
          if (!feature['経度'].match(/^[0-9]+(\.[0-9]+)?$/)) {
            continue
          }

          const shop = {
            ...feature,
            index: i
          }

          nextShopList.push(shop)
        }
        setShopList(nextShopList)
      });
    });
  }, [])

  return (
    <div className="app">
      <div className="app-body">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home data={shopList} />} />
            <Route path="/list" element={<List data={shopList} />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </HashRouter>
      </div>
      <div className="app-footer">
        <Tabbar />
      </div>
    </div>
  );
}

export default App;
