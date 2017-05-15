#import "RNDocumentPicker.h"

#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#else // back compatibility for RN version < 0.40
#import "RCTConvert.h"
#import "RCTBridge.h"
#endif

@interface RNDocumentPicker () <UIDocumentMenuDelegate,UIDocumentPickerDelegate>
@end


@implementation RNDocumentPicker {
    NSMutableArray *composeViews;
    NSMutableArray *composeCallbacks;
}

@synthesize bridge = _bridge;

- (instancetype)init
{
    if ((self = [super init])) {
        composeCallbacks = [[NSMutableArray alloc] init];
        composeViews = [[NSMutableArray alloc] init];
    }
    return self;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(show:(NSDictionary *)options
                  callback:(RCTResponseSenderBlock)callback) {

    NSArray *allowedUTIs = [RCTConvert NSArray:options[@"filetype"]];
    UIDocumentMenuViewController *documentPicker = [[UIDocumentMenuViewController alloc] initWithDocumentTypes:(NSArray *)allowedUTIs inMode:UIDocumentPickerModeImport];

    [composeCallbacks addObject:callback];


    documentPicker.delegate = self;
    documentPicker.modalPresentationStyle = UIModalPresentationFormSheet;

    UIViewController *rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
    while (rootViewController.modalViewController) {
        rootViewController = rootViewController.modalViewController;
    }
    [rootViewController presentViewController:documentPicker animated:YES completion:nil];
}


- (void)documentMenu:(UIDocumentMenuViewController *)documentMenu didPickDocumentPicker:(UIDocumentPickerViewController *)documentPicker {
    documentPicker.delegate = self;
    UIViewController *rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
    while (rootViewController.modalViewController) {
        rootViewController = rootViewController.modalViewController;
    }
    [rootViewController presentViewController:documentPicker animated:YES completion:nil];
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentAtURL:(NSURL *)url {
    if (controller.documentPickerMode == UIDocumentPickerModeImport) {
        RCTResponseSenderBlock callback = [composeCallbacks lastObject];
        [composeCallbacks removeLastObject];

        [url startAccessingSecurityScopedResource];

         NSFileCoordinator *coordinator = [[NSFileCoordinator alloc] init];
         __block NSError *error;
        __block NSData *fileData;

         [coordinator coordinateReadingItemAtURL:url options:NSFileCoordinatorReadingForUploading error:&error byAccessor:^(NSURL *newURL) {
             // We move the file to a new directory so other things can access it,
             // otherwise the file gets deleted soon after this block is done
             NSString *rootPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex:0];
             NSString *toPath = [rootPath stringByAppendingPathComponent:@"importedFiles"];
             NSError * error = nil;
             [[NSFileManager defaultManager] createDirectoryAtPath:toPath
                                       withIntermediateDirectories:YES
                                                        attributes:nil
                                                             error:&error];
             NSString *destStr = [toPath stringByAppendingPathComponent:[newURL lastPathComponent]];

             NSError *fileConversionError;
             fileData = [NSData dataWithContentsOfURL:newURL options:NSDataReadingUncached error:&fileConversionError];
             [fileData writeToFile:destStr atomically:YES];

             NSMutableDictionary* result = [NSMutableDictionary dictionary];
             NSURL *movedUrl = [NSURL fileURLWithPath:destStr];

             [result setValue:movedUrl.absoluteString forKey:@"uri"];
             [result setValue:[movedUrl lastPathComponent] forKey:@"fileName"];

             NSError *attributesError = nil;
             NSDictionary *fileAttributes = [[NSFileManager defaultManager] attributesOfItemAtPath:movedUrl.path error:&attributesError];
             if(!attributesError) {
                 [result setValue:[fileAttributes objectForKey:NSFileSize] forKey:@"fileSize"];
             } else {
                 NSLog(@"%@", attributesError);
             }

             callback(@[[NSNull null], result]);

         }];

         [url stopAccessingSecurityScopedResource];

    }
}

@end
