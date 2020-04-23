import React from "react";
// @ts-ignore
import geojsonExtent from '@mapbox/geojson-extent'
import toGeoJson from './toGeoJson'
import setCluster from './setCluster'
import Shop from './Shop'

type ShopData = {
  [key: string]: string;
}

type ShopList = {
  [key: string]: ShopData
}

type Props = {
  orientation: any;
  data: ShopList;
};

const CSS: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
}

const Content = (props: Props) => {
  const mapNode = React.useRef<HTMLDivElement>(null);
  const [ mapObject, setMapObject ] = React.useState<any>()
  const [ id, setId ] = React.useState<string>('')
  const [ geoJson, setGeoJson ] = React.useState<any>({})

  React.useEffect(() => {
    if (!mapObject || !geoJson) {
      return
    }

    const textColor = '#000000'
    const textHaloColor = '#FFFFFF'

    mapObject.addSource('shops', {
      type: 'geojson',
      data: geoJson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    mapObject.addLayer({
      id: 'shop-points',
      type: 'circle',
      source: 'shops',
      filter: ['all',
        ['==', '$type', 'Point'],
      ],
      paint: {
        'circle-radius': 13,
        'circle-color': '#FF0000',
        'circle-opacity': 0.4,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-opacity': 1,
      },
    })

    mapObject.on('mouseenter', 'shop-points', () => {
      mapObject.getCanvas().style.cursor = 'pointer'
    })

    mapObject.on('mouseleave', 'shop-points', () => {
      mapObject.getCanvas().style.cursor = ''
    })

    mapObject.on('click', 'shop-points', (event: any) => {
      if (event.features[0].properties._id) {
        setId(event.features[0].properties._id)
      }
    })

    mapObject.addLayer({
      id: 'shop-symbol',
      type: 'symbol',
      source: 'shops',
      filter: ['all',
        ['==', '$type', 'Point'],
      ],
      paint: {
        'text-color': textColor,
        'text-halo-color': textHaloColor,
        'text-halo-width': 2,
      },
      layout: {
        'text-field': "{店名}",
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-anchor': 'top',
        'text-max-width': 12,
        'text-offset': [0, 1.2],
        'text-allow-overlap': false,
      },
    })

    setCluster(mapObject)
  }, [mapObject, geoJson])

  React.useEffect(() => {
    if (!mapNode.current) {
      return
    }

    // @ts-ignore
    const { geolonia } = window;

    const style = 'geolonia/basic'

    const container = document.createElement('div')
    container.dataset.geolocateControl = 'on'
    container.dataset.marker = 'off'
    container.dataset.gestureHandling = 'off'
    container.style.width = '100%'
    container.style.height = '100%'

    mapNode.current.innerHTML = ''
    mapNode.current.appendChild(container)

    const geojson = toGeoJson(props.data)
    setGeoJson(geojson)
    const bounds = geojsonExtent(geojson)

    const map = new geolonia.Map({
      container: container,
      style: style,
      bounds: bounds,
      fitBoundsOptions: {padding: 100}
    });

    map.on('load', () => {
      map.setLayoutProperty('building', 'visibility', 'none')
      map.setLayoutProperty('poi', 'visibility', 'none')
      map.setLayoutProperty('poi-primary', 'visibility', 'none')

      setMapObject(map)
    })

  }, [mapNode, props.orientation, props.data])

  const closeHandler = () => {
    setId('')
  }

  return (
    <div style={CSS}>
      <div ref={mapNode} style={CSS}></div>
      {id?
        <Shop data={props.data} shopId={id} close={closeHandler} />
        :
        <></>
      }
    </div>
  );
};

export default Content;
