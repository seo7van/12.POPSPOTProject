import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './styles/Main.css';
import './styles/Main_list.css';
import axios from 'axios';

const Main = ({setTag}) => {
	const [events, setEvents] = useState([]);
  const [banner, setBanner] = useState(0);
  const [list, setList] = useState(0);
  const [banners, setBanners] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [lists, setLists] = useState([]);

  const navigate = useNavigate();
  
	const tagRemover = /<[^>]*>/g;
	const imgRemover = /image[0-9]+/g;
	const alertRemover = /\[alert\](?:!\s\w)*[가-힣]*(?:\s[가-힣]*)*/g;
	
	console.log(typeof setTag);
  
  // 서버에서 최근 8개의 이벤트를 가져옴
  useEffect(() => {
    axios.get('/api/event/recent-events')
      .then(response => {
		console.log(response.data);
		const eventData = response.data;		
        setEvents(eventData);
      })
      .catch(error => {
        console.error('서버로 요청 중 에러 발생:', error);
      });
  }, []);
  
  useEffect(() => {
		if(events.length === 8){
			const [bannersSlice, listsSlice] = [events.slice(0,3), events.slice(3,8)];
			setBanners([...bannersSlice]);
			setLists([...listsSlice]);
		}
	}, [events]);

  const totalBanners = 3;
  
  const nextList = () => {
    if (list < 5) {
      setList(list + 1);
    } else {
			setList(0);
		}
  };
  
  const prevList = () => {
    if (list < 0) {
      setList(list - 1);
    } else {
			setList(4);
		}
  };

  const nextBanner = () => setBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setBanner((prev) => (prev - 1 + banners.length) % banners.length);

  const setTagEvent = (lists, list, i, num) => {
		setTag(lists[(list + i)% lists.length].tags.split(',')[num])
	};

  // 3초마다 배너 애니메이션이 끝난 뒤 배너 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true); // 애니메이션 시작
      setBanner((prev) => (prev + 1) % banners.length); // 배너 변경
      setTimeout(() => setAnimate(false), 1000); // 1초 후 애니메이션 종료
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <>
      <section className='main_container'>
      {banners.length > 1 ? 
        <figure>
          <img  
            src={parseImgSrc(banners[banner])}
            alt="Main" 
            className={`main_image ${animate ? "slide-in" : ""}`}
            onClick={() => navigate(`/event/${banners[banner].eventNo}`)}
            style={{cursor: 'pointer'}}
          />
          	<div className="overlay_text">
            <h1 className="overlay_title">{banners[banner].title}</h1>
            <h3 className="overlay_detail">{
							`${banners[banner]
								.content
								.replace(tagRemover, '')
								.replace(imgRemover, '')
								.replace(alertRemover, '')
								.substring(0, 80)}...`
						}</h3>
          </div>

          <div className="main_button_container">
              <button onClick={prevBanner} className="main_toggle_button"> &lt; </button>
              <button onClick={nextBanner} className="main_toggle_button"> &gt; </button>
          </div>

          <div className="indicators"> {/* 슬라이드 인디케이터 */}
            {banners.map((_, index) => (
              <div
                key={index}
                className={`indicator ${
                index === banner ? 'active' : 'inactive'
                }`}
              ></div>
            ))}
          </div>
        </figure> : null}
      </section>

      <section className="list_container">
        <h2 className='list_main_name'>POP IN POP-UP</h2>
          <div class="rotated_background_wrapper">
            <h2 class="rotated_background_text">POPSPOT POPSPOT POPSPOT POPSPOT POPSPOT POPSPOT POPSPOT POPSPOT POPSPOT</h2>
          </div>
        <div className="list_items"> 
          <div className="list_btn_container">
            <button className="list_btn" onClick={() => prevList()}>&lt;</button>
            <button className="list_btn" onClick={() => nextList()}>&gt;</button>
          </div>

            <div className="list_items_container">
              {lists.length > 1 && lists.map((e, i) => (
                <article className="list_item" key={i} onClick={() => navigate(`/event/${lists[(list + i)% lists.length].eventNo}`)}>
                  <img src={parseImgSrc(lists[(list + i)% lists.length])} alt="list_img" className="list_img" />
                  <div className="text_content">
                    <h3 className="list_subtitle">{lists[(list + i)% lists.length].title}</h3>
                    <p className="list_detail">{
											`${lists[(list + i)% lists.length]
													.content
													.replace(tagRemover, '')
													.replace(imgRemover, '')
													.replace(alertRemover, '')
													.substring(0, 50)}...`}</p>
                    <button className="list_button" onClick={() => {
											setTagEvent(lists, list, i, 0);
											navigate('/popup/tag?');
                    }}>
                    	{`${lists[(list + i)% lists.length].tags.split(',')[0]}`}
                    </button>&nbsp;&nbsp;&nbsp;
                    <button className="list_button" onClick={() => setTagEvent(lists, list, i, 1)}>
                    	{`${lists[(list + i)% lists.length].tags.split(',')[1]}`}
                  	</button>
                    </div>
                </article>
              ))}
            </div>
            {/* <img className="list_btn" src='/img/gt.png' alt='' onClick={() => nextList()}/> */}
        </div>
      </section>
    </>
  );
}

const parseImgSrc = (e) => {
	const hyphenRemover = /-/g;
	
	const checkDir = (createdDate) => {
		const date = createdDate.replace(hyphenRemover, '');
		
		return date.substring(0,8);
	}
	
	return `/img/
		${e.company}${checkDir(e.createdDate)}/
		${e.images !== null && e.images !== '' ? e.images.split(',')[0] : 'FullStar'}.png`;
}

export default Main;
