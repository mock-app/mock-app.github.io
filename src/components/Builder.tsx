import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import styles from "./Builder.module.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import { styled } from "@mui/material/styles";
import { generateBookCover, generateMusicCover } from "../logic/canvas";
import { useParams } from "react-router-dom";
import jsmediatags from "jsmediatags-web";
import { getPublicUrl } from "../logic/utils";
import { generateMusicStory } from "../logic/video";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface Props {
  isMusic?: boolean;
}

export const Builder: React.FC<Props> = (props) => {
  const [file, setFile] = React.useState<File>();
  const [output, setOutput] = React.useState<File>();

  const handleSelectFile = (files: FileList) => {
    setFile(files[0]);
  };

  const make = () => {
    if (!file) {
      alert("No file is selected.");
      return;
    }

    if (props.isMusic) {
      jsmediatags.read(file, {
        onSuccess: function (tag: any) {
          const image = tag.tags.picture;
          const blob = image
            ? new Blob([new Uint8Array(image.data)], {
                type: image.format,
              })
            : undefined;
          const coverUrl = blob ? URL.createObjectURL(blob) : undefined;

          const getDescription = (
            artist: string | undefined,
            album: string | undefined
          ) => {
            if (artist && album) {
              return `${artist} · ${album}`;
            }
            if (artist) {
              return artist;
            }
            if (album && album !== tag.tags.title) {
              return album;
            }
            return "";
          };
          generateMusicCover(
            coverUrl ?? getPublicUrl("images/sampleMusic.jpg"),
            tag.tags.title ?? "Music",
            getDescription(tag.tags?.artist, tag.tags?.album)
          ).then((output) => {
            setOutput(output);
            generateMusicStory(output, file, (progress) => {
              window.console.log(progress);
              setProgress(progress);
            }).then((output) => {
              setOutput(output);
            });
          });
        },
      });
      return;
    }
    generateBookCover(URL.createObjectURL(file)).then((output) => {
      setOutput(output);
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(output);
    a.download = `file.${props.isMusic ? "mp4" : "jpg"}`;
    a.click();
  };

  const handleOnCoverClick = (src: string) => {
    generateBookCover(src).then((output) => {
      setOutput(output);
    });
  };

  const [progress, setProgress] = useState(0);

  function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number }
  ) {
    return (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  const [search, setSearch] = useState("");

  interface Book {
    title: string;
    coverSrc: string;
    author: string;
    id: string;
  }

  const [books, setBooks] = useState<Book[]>([]);

  const handleSearch = () => {
    fetch(`https://msapi.ketab.ir/search/?query="${search}"&limit=10`, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((data) => {
        window.console.log(data?.result?.groups?.printableBook?.items);
        data = data?.result?.groups?.printableBook?.items;
        setBooks(
          data
            .filter(
              (item: {
                book_author: string;
                book_title: string;
                image: string;
                id: string;
              }) => item.image
            )
            .map(
              (item: {
                book_author: string;
                book_title: string;
                image: string;
                id: string;
              }) => {
                return {
                  title: item.book_title,
                  author: item.book_author,
                  coverSrc: item.image,
                  id: item.id,
                };
              }
            )
        );
      })
      .catch((error) => {
        window.console.log(error);
      });
  };

  return (
    <div className={styles.Wrapper}>
      {output ? (
        <>
          <IconButton aria-label="delete" onClick={() => setOutput(undefined)}>
            <DeleteIcon color="primary" />
          </IconButton>
          {progress !== 0 && (
            <div className={styles.Progress}>
              <CircularProgressWithLabel value={progress} />
            </div>
          )}
          {output.type.startsWith("video") ? (
            <video
              src={URL.createObjectURL(output)}
              className={styles.Output}
              controls
            />
          ) : (
            <img src={URL.createObjectURL(output)} className={styles.Output} />
          )}
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudDownloadIcon />}
            sx={{ marginTop: 3 }}
            onClick={handleDownload}
          >
            Download
          </Button>
        </>
      ) : (
        <>
          <div className={styles.Container}>
            <p>{props.isMusic ? "Music visualizer" : "Book Mockup"}</p>
            {!props.isMusic && (
              <>
                <Paper
                  component="form"
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                    width: 400,
                    direction: "rtl",
                    marginBottom: 3,
                  }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="نام کتاب را وارد کنید."
                    inputProps={{ "aria-label": "search google maps" }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <IconButton
                    type="button"
                    sx={{ p: "10px" }}
                    aria-label="search"
                    onClick={handleSearch}
                  >
                    <SearchIcon />
                  </IconButton>
                </Paper>

                <List
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                    marginBottom: 3,
                    direction: "rtl",
                  }}
                >
                  {books &&
                    books.map((book) => {
                      return (
                        <>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <img
                                src={book.coverSrc}
                                crossOrigin="anonymous"
                                className={styles.BookCover}
                                onClick={() =>
                                  handleOnCoverClick(book.coverSrc)
                                }
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={book.title}
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    sx={{ display: "inline" }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {book.author}
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </>
                      );
                    })}
                </List>
              </>
            )}
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Upload file
              <VisuallyHiddenInput
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files) handleSelectFile(e.target.files);
                }}
              />
            </Button>
            {file && (
              <List
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
              >
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <ImageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={file?.name.split(".")[0]}
                    secondary={file?.name.split(".")[1]}
                  />
                </ListItem>
              </List>
            )}
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              sx={{
                marginTop: 2,
              }}
              onClick={make}
            >
              Build
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
