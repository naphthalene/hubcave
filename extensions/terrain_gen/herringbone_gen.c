#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"        // http://nothings.org/stb_image.c

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"  // http://nothings.org/stb/stb_image_write.h

#define STB_HBWANG_IMPLEMENTATION
#include "stb_hbwang.h"

int mapgen(unsigned char *tileset_file,
           unsigned int xsize,
           unsigned int ysize)

   unsigned char *data;
   int xs,ys, w,h;
   stbhw_tileset ts;


   data = stbi_load(tileset, &w, &h, NULL, 3);
   xs = atoi(argv[2]);
   ys = atoi(argv[3]);
   if (data == NULL) {
      fprintf(stderr, "Error opening or parsing '%s' as an image file\n", argv[1]);
      exit(1);
   }
   if (xs < 1 || xs > 1000) {
      fprintf(stderr, "xsize invalid or out of range\n");
      exit(1);
   }
   if (ys < 1 || ys > 1000) {
      fprintf(stderr, "ysize invalid or out of range\n");
      exit(1);
   }

   stbhw_build_tileset_from_image(&ts, data, w*3, w, h);
   free(data);

   // allocate a buffer to create the final image to
   data = malloc(3 * xs * ys);

   srand(time(NULL));
   stbhw_generate_image(&ts, NULL, data, xs*3, xs, ys);

   stbi_write_png("test_map.png", xs, ys, 3, data, xs*3);

   stbhw_free_tileset(&ts);
   free(data);

   return 0;
}
