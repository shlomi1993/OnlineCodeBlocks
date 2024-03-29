// Written by Shlomi Ben-Shushan.

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import '../App.css';

const backendUri = require('../config.json').gateway;

/**
 * The Lobby componenet is shown after the user was logged in.
 * It creates a list of cards where Each card links to a list of code-blocks.
 * It also allows the user to create new code-blocks.
 */
function Lobby() {

  const navigate = useNavigate();
  const location = useLocation();  // used to reference data from the Login.

  const username = location.state.username;

  const [blockList, setBlockList] = useState([]);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [newBlockName, setNewBlockName] = useState('');

  // This function fetches a list of blocks from the DynamoDB.
  const fetchBlockList = async () => {
    let uri = backendUri + 'getAllCodeBlocks';
    fetch(uri)
      .then(resp => resp.json())
      .then(data => setBlockList(data))
  }

  useEffect(() => {
    fetchBlockList();
  }, [])

  // This function navigates the uesr to the code-block he chose.
  const navigateToCodeBlock = (codeblock) => {
    const options = {
      state: {
        username: username,
        codeblock: codeblock
      }
    }
    navigate('../CodeBlock', options);
  }

  // This function determine whether the create button is enabled or disabled. 
  const setCreateButton = (input) => {
    input = input.target.value;
    if (input.length === 0) {
      setCreateButtonDisabled(true);
      return;
    }
    for (let i = 0; i < blockList.length; i++) {
      if (blockList[i].block_name === input) {
        setCreateButtonDisabled(true);
        return;
      }
    }
    setCreateButtonDisabled(false);
    setNewBlockName(input);
  }

  // This function requests to create a new code-block in the DynamoDB once the create button clicked.
  const createCodeBlock = () => {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newBlockName })
    };
    fetch(backendUri + 'createblock', options)
      .then(response => response.json())
      .then(data => {
        setNewBlockName('');
        document.getElementById('textField').value = '';
        blockList.push(data.block);
      });
  }

  // This function requests to remove the given code-block from the DynamoDB once the small trash-icon clicked.
  const removeCodeBlock = (codeblock) => {
    const options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch(backendUri + 'deleteblock?id=' + codeblock.block_id, options)
      .then(response => response.json())
      .then(data => window.location.reload());
  };

  // This variable holds the lobby-list to be displayed once all data is fetched.
  const content = <div>
    <h2 className='Lobby-header'>Select code block</h2>
    <div className="Lobby-list">
      {blockList.map((cb) => {
        return (
          <Box width='380px' className='Lobby-card'>
            <Card>
              <CardContent>
                <div className='Lobby-card-content'>
                  <div className='Lobby-remove-button'>
                    <IconButton aria-label="delete" size="small" onClick={() => removeCodeBlock(cb)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <div className='Lobby-card-text'>
                    <Typography  gutterBottom variant='h5' component='div'>
                        {cb.block_name}
                    </Typography>
                  </div>
                  <div className='Lobby-join-button'>
                    <Button variant='text' onClick={() => navigateToCodeBlock(cb)}>Join</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Box>    
        );
      })}
      <Box width='380px' className='Lobby-card'>
        <Card>
          <CardContent>
            <div className='Lobby-card-content'>
              <div className='Lobby-create-card-text'>
                <Typography gutterBottom variant='h5' component='div'>
                  ➕ New Code Block
                </Typography>
              </div>
              <div className='Lobby-create'>
                <TextField id="textField" label="Block Title" variant="outlined" onChange={(x) => setCreateButton(x)}/>
                <Button variant='text' onClick={() => createCodeBlock()} disabled={createButtonDisabled}>Create</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Box>  
    </div>
    
  </div>

  // This variable holds a temporal contend to be displayed untill all data is fetched. 
  const loading = <div className='Lobby-loading'>
      <img src={require('../assets/loading.gif')} className='Lobby-loading-gif'/>
      <h2>Loading...</h2>
    </div>;

  // The function renders the content according to the size of the block-list.
  return (
    blockList.length === 0 ? loading : content
  );
}
 
export default Lobby;