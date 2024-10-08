import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.scss";

import Home from './App/Home'
import List from './App/List'
import AboutUs from './App/AboutUs'
import Category from './App/Category'
import Images from './App/Images'

import Tabbar from './App/Tabbar'
import config from "./config.json";
import Papa from 'papaparse'

// You can see config.json after running `npm start` or `npm run build`
// import config from './config.json'

const sortShopList = async (shopList: Pwamap.ShopData[]) => {

  // 新着順にソート
  return shopList.sort(function (item1, item2) {
    return Date.parse(item2['タイムスタンプ']) - Date.parse(item1['タイムスタンプ'])
  });

}

const App = () => {
  const [shopList, setShopList] = React.useState<Pwamap.ShopData[]>([])

  React.useEffect(() => {
    fetch(config.data_url)
    .then((response) => {
      return response.ok ? response.text() : Promise.reject(response.status);
    })
    .then((data) => {

      Papa.parse(data, {
        header: true,
        complete: (results) => {
          const features = results.data

          const nextShopList: Pwamap.ShopData[] = []
          for (let i = 0; i < features.length; i++) {
            const feature = features[i] as Pwamap.ShopData
            if (!feature['緯度'] || !feature['経度'] || !feature['スポット名']) {
              continue;
            }
            if (!feature['緯度'].match(/^[0-9]+(\.[0-9]+)?$/)) {
              continue
            }
            if (!feature['経度'].match(/^[0-9]+(\.[0-9]+)?$/)) {
              continue
            }
            const shop = {
              // @ts-ignore
              index: i,
              ...feature
            }

            nextShopList.push(shop)
          }
          sortShopList(nextShopList).then((sortedShopList) => {
            setShopList(sortedShopList)
          })
        }
      });
    });
  }, [])


  return (
    <div className="app">
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Home data={shopList} />} />
          <Route path="/list" element={<List data={shopList} />} />
          <Route path="/category" element={<Category data={shopList} />} />
          <Route path="/images" element={<Images data={shopList} />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </div>
      <div className="app-footer">
        <Tabbar />
      </div>
    </div>
  );
}

export default App;
