import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  mashineStatus,
  GALLERY_SCROLL_TIMEOUT,
  ApiOptions,
} from '../../services/options';

import { fetchData } from '../../services';
import { message } from '../../services/messages';

import Searchbar from '../Searchbar';
import ImageGallery from '../ImageGallery';
import Loader from '../Loader';
import IdleScreen from '../IdleScreen';
import Button from '../Button';

import GlobalStyle from '../GlobalStyle';
import AppStyled from './App.styled';

export const App = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [searchData, setSearchData] = useState([]);
  const [status, setStatus] = useState(mashineStatus.IDLE);
  const [loadMoreBtnVisibility, setLoadMoreBtnVisibility] = useState(false);
  const [error, setError] = useState('');

  // ========== Functions ======================

  const handleSerch = ({ searchQuery }) => {
    if (query !== searchQuery) {
      setPage(1);
      setSearchData([]);
    }

    setQuery(searchQuery);
  };

  const scrollNextPage = () => {
    setTimeout(() => {
      window.scroll({
        behavior: 'smooth',
        top: document.documentElement.scrollHeight,
      });
    }, GALLERY_SCROLL_TIMEOUT);
  };

  const nextPage = () => {
    setPage(page + 1);

    scrollNextPage();
  };

  // ================================================================
  // ============ Effects ===========================================

  useEffect(() => {
    if (!query) {
      return;
    }

    const getImages = async  () => {
      setStatus(mashineStatus.LOADING);
  
      try {
        // ============== For render =============
        const data = await fetchData(query, page);
        const hits = await data.hits;
        const imagesPerPage = ApiOptions.per_page;
        // ============== For toasts =============
        const imagesInFetch = hits.length;
        const totalImages = data.totalHits;
  
        //============== Toast when nothing found ================
        if (!imagesInFetch) {
          toast.info(`No images found!`);
          setStatus(mashineStatus.SUCCESSFULLY);
          setLoadMoreBtnVisibility(false);
          return;
        }
        //========================================================
        // ============== Toast total found message ==============
        const imagesLeft =
          imagesInFetch === imagesPerPage
            ? totalImages - imagesPerPage * page
            : 0;
  
        toast.info(`Total found: ${totalImages}. Images left: ${imagesLeft}.`);
        //==========================================================
        //=================== Rendering ============================
        setSearchData(searchData => [...searchData, ...hits]);
        setStatus(mashineStatus.SUCCESSFULLY);
        setLoadMoreBtnVisibility(imagesInFetch >= imagesPerPage ? true : false);
      } catch ({ code, message }) {
        // =============== Toast when have error ===================
        toast.error(`${code}: ${message}`);
  
        setError(`${code}: ${message}`);
        setStatus(mashineStatus.SUCCESSFULLY);
      }
    }; getImages ()
  }, [page, query]);

  //========= Console on Error =======================================

  useEffect(() => {
    if (!error) {
      return;
    }
    console.log('Error : ', error);
  }, [error]);

  // =================================================================
  // ========== Render ===============================================

  return (
    <>
      <GlobalStyle />
      <AppStyled>
        <Searchbar onSubmit={handleSerch} />

        {status === mashineStatus.IDLE && (
          <IdleScreen>{message.IDLE}</IdleScreen>
        )}

        {status === mashineStatus.LOADING && <Loader />}

        <ImageGallery searchData={searchData} />

        {status === mashineStatus.SUCCESSFULLY && loadMoreBtnVisibility && (
          <Button onClick={nextPage} />
        )}
        <ToastContainer />
      </AppStyled>
    </>
  );
};

// =========== Props ============================================

App.propTypes = {
  searchString: PropTypes.string,
};
