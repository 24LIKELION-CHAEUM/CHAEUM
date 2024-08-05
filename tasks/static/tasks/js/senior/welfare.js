document.addEventListener('DOMContentLoaded', function() {
    // Kakao Maps API가 로드되었는지 확인
    if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined' || typeof kakao.maps.services === 'undefined') {
        console.error('Kakao Maps API가 로드되지 않았습니다.');
        return;
    }

    // Kakao Maps API 설정 및 지도 초기화 코드
    var mapContainer = document.getElementById('map'); // 지도를 표시할 div
    var mapOption = { 
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    }; 
    var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

    var username = '홍길동';
    var userPosition = null;
    var marker = new kakao.maps.Marker(); // 클릭한 위치를 표시할 마커입니다
    var infowindow = new kakao.maps.InfoWindow({zindex:1}); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude; 
            var lon = position.coords.longitude; 

            userPosition = { lat: lat, lng: lon };
            var locPosition = new kakao.maps.LatLng(lat, lon); 

            displayMarker(locPosition);
            updateLocationInfo(lat, lon);
            searchFacilities(lat, lon, '노인 복지 시설');
        }, function(error) {
            console.error("Error occurred. Error code: " + error.code);
            var defaultPosition = new kakao.maps.LatLng(37.566826, 126.9786567);
            displayMarker(defaultPosition);
            updateLocationInfo(37.566826, 126.9786567);
            searchFacilities(37.566826, 126.9786567, '노인 복지 시설');
        }); 
    } else {
        var defaultPosition = new kakao.maps.LatLng(37.566826, 126.9786567);
        displayMarker(defaultPosition);
        updateLocationInfo(37.566826, 126.9786567);
        searchFacilities(37.566826, 126.9786567, '노인 복지 시설');
    }

    function displayMarker(locPosition) {
        var marker = new kakao.maps.Marker({  
            map: map, 
            position: locPosition
        }); 
        map.setCenter(locPosition);      
    }    

    function updateLocationInfo(lat, lon) {
        var geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(lon, lat, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var detailAddr = result[0].address_name;
                var arr = detailAddr.split(" ");
                var city = arr[0];
                var district = arr[1];
                var subDistrict = arr[2];
                var userLocationElement = document.getElementById('user-location');
                userLocationElement.innerHTML = `
                    <div class="location-container">
                        <img src="/img/위치.svg" alt="location icon" class="location-icon">
                        <span class="location-text">내 위치</span>
                        <span class="locationtt"> ${city} ${district} ${subDistrict}</span>
                    </div>
                `;
            } else {
                console.error('주소 변환 실패:', status);
            }
        });
    }

    function searchFacilities(lat, lon, keyword, isSearch) {
        var places = new kakao.maps.services.Places();
        var callback = function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                // 사회, 공공기관 카테고리만 필터링
                var filteredFacilities = result.filter(function(place) {
                    return place.category_name.includes("사회") || place.category_name.includes("공공기관")|| place.category_name.includes("병원");
                }).map(function(place) {
                    var distance = calculateDistance(lat, lon, place.y, place.x);
                    return {
                        title: place.place_name,
                        address: place.road_address_name || place.address_name,
                        sub: place.category_name,
                        phone: place.phone,
                        lat: place.y,
                        lon: place.x,
                        distance: distance.toFixed(1),
                        walkingTime: calculateWalkingTime(distance)
                    };
                });
                console.log('검색 결과:', filteredFacilities); // 검색 결과를 콘솔에 출력
                var title = isSearch ? '검색 결과' : `${username} 님과 가까운 주변 복지시설`;
                displayBottomSheet(filteredFacilities, title);
                displayMarkers(filteredFacilities);
            } else {
                console.error('검색 실패:', status);
            }
        };
        places.keywordSearch(keyword, callback, { 
            location: new kakao.maps.LatLng(lat, lon),
            radius: 5000 
        });
    }

    function displayMarkers(facilities) {
        for (var i = 0; i < facilities.length; i++) {
            var marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(facilities[i].lat, facilities[i].lon),
                title: facilities[i].title,
                
            });
        }
    }

    function truncateString(str, num) {
        return (str.length <= num) ? str : str.slice(0, num) + '...';
    }

    function displayBottomSheet(facilities, title) {
        var bottomSheet = document.getElementById('bottom-sheet');
        var facilityList = document.getElementById('facility-list');
        facilityList.innerHTML = '';
        if (facilities.length === 0) {
            facilityList.innerHTML = `<div class="no-results-message"> 검색 결과가 없어요 다시 검색해주세요!</div>`;
        } else {
            facilities.forEach(function(facility, index) {
                var item = document.createElement('div');
                item.className = 'facility-item';
                var truncatedTitle = truncateString(facility.title, 15);
                var truncatedSub = truncateString(facility.sub, 20);
                var truncatedAddress = truncateString(facility.address, 25);
                var distance = facility.distance;
                var walkingTime = facility.walkingTime;
                item.innerHTML = `
                    <div class="facility-info">
                        ${index === 0 ? `<h2>${title}</h2>` : ''}
                        <img src="/img/facility.svg" alt="Facility Image">
                        <div class="facility-name">${truncatedTitle}</div>
                        <div class="facility-sub">${truncatedSub}</div>
                        <div class="facility-distance">${distance}km | 도보 ${walkingTime}분</div>
                        <div class="facility-address">${truncatedAddress}</div>
                        <button class="call-button" onclick="showCallPopup('${facility.title}', '${facility.phone}')">
                            <img src =  "{% static 'img/call.svg' %}" alt="call">
                        </button>
                    </div>
                `;
                facilityList.appendChild(item);
            });
        }
        bottomSheet.classList.add('active');
    }

    function makeCall(phoneNumber) {
        window.location.href = `tel:${phoneNumber}`;
    }

    window.showCallPopup = function(facilityName, phoneNumber) {
        var popupBackground = document.createElement('div');
        popupBackground.className = 'popup-background active';
        document.body.appendChild(popupBackground);

        var popup = document.getElementById('call-popup');
        var popupFacilityName = document.getElementById('popup-facility-name');
        var confirmCallButton = document.getElementById('confirm-call');

        popupFacilityName.textContent = `${facilityName}에 전화할까요?`;
        confirmCallButton.onclick = function() {
            makeCall(phoneNumber);
        };

        popup.classList.add('active');

        document.getElementById('cancel-call').onclick = function() {
            popup.classList.remove('active');
            popupBackground.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(popupBackground);
            }, 300);
        };
    }

    var bottomSheet = document.getElementById('bottom-sheet');
    var bottomSheetHandle = document.getElementById('bottom-sheet-handle');
      
    bottomSheetHandle.addEventListener('click', function() {
        if (bottomSheet.classList.contains('active')) {
            bottomSheet.classList.remove('active');
            bottomSheet.style.height = '30%';
        } else {
            bottomSheet.classList.add('active');
            bottomSheet.style.height = `calc(100vh - 110px)`;
        }
    });

    document.getElementById('search-button').addEventListener('click', function() {
        var searchInput = document.getElementById('search-input').value;
        searchFacilities(userPosition.lat, userPosition.lng, searchInput, true);
    });

    function calculateDistance(lat1, lon1, lat2, lon2) {
        var R = 6371; 
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function calculateWalkingTime(distance) {
        var speed = 5;
        var time = (distance / speed) * 60;
        return Math.round(time);
    }

});
